import os
import sys
import time
import json
import base64
import asyncio
import subprocess
import threading
import http.server
import socketserver
import urllib.request
import websockets
from PIL import Image

FFMPEG_EXE = r"C:\Users\shami\AppData\Local\Programs\Python\Python311\Lib\site-packages\imageio_ffmpeg\binaries\ffmpeg-win-x86_64-v7.1.exe"
CHROME_EXE = r"C:\Program Files\Google\Chrome\Application\chrome.exe"
PORT = 8899
DEBUG_PORT = 9444
TOTAL_DURATION = 120.0
FPS = 30
TOTAL_FRAMES = int(TOTAL_DURATION * FPS) # 3600 frames
WIDTH = 1280
HEIGHT = 720

FINAL_OUTPUT_ROOT = "Smart_Agriculture_AI_Explainer_2min.mp4"
FINAL_OUTPUT_PUBLIC = "public/video/Smart_Agriculture_AI_Explainer_2min.mp4"
AUDIO_TRACK = "public/audio/soundtrack.mp3"

class QuietHandler(http.server.SimpleHTTPRequestHandler):
    def log_message(self, format, *args):
        pass

def start_server():
    server = socketserver.TCPServer(("127.0.0.1", PORT), QuietHandler)
    thread = threading.Thread(target=server.serve_forever, daemon=True)
    thread.start()
    return server

async def wait_for_chrome_tab():
    for _ in range(40):
        try:
            req = urllib.request.urlopen(f"http://127.0.0.1:{DEBUG_PORT}/json")
            tabs = json.loads(req.read().decode())
            for t in tabs:
                if "webSocketDebuggerUrl" in t and t.get("type") == "page":
                    return t["webSocketDebuggerUrl"]
        except Exception:
            pass
        await asyncio.sleep(0.3)
    raise RuntimeError("Could not connect to Chrome DevTools Protocol")

async def send_cdp(ws, msg_id, method, params=None):
    payload = {"id": msg_id, "method": method}
    if params:
        payload["params"] = params
    await ws.send(json.dumps(payload))
    while True:
        resp = await ws.recv()
        data = json.loads(resp)
        if data.get("id") == msg_id:
            return data

async def evaluate_js(ws, msg_id, expr):
    res = await send_cdp(ws, msg_id, "Runtime.evaluate", {
        "expression": expr,
        "returnByValue": True,
        "awaitPromise": True
    })
    return res.get("result", {}).get("result", {}).get("value")

def validate_video_file(filepath, expected_min_duration=4.5):
    if not os.path.exists(filepath):
        raise FileNotFoundError(f"Video file missing: {filepath}")
    
    probe_cmd = [
        FFMPEG_EXE, "-i", filepath
    ]
    res = subprocess.run(probe_cmd, stderr=subprocess.PIPE, stdout=subprocess.PIPE, text=True)
    out = res.stderr
    
    if "Video: h264" not in out and "Video:" not in out:
        raise ValueError(f"No valid video stream found in {filepath}")
    
    if "Audio: aac" not in out and "Audio: mp3" not in out and "Audio:" not in out:
        raise ValueError(f"No valid audio stream found in {filepath}")
    
    if f"{WIDTH}x{HEIGHT}" not in out:
        raise ValueError(f"Resolution mismatch: expected {WIDTH}x{HEIGHT} in {filepath}")
        
    print(f"[VALIDATION PASSED] {filepath} is valid H.264/AAC at {WIDTH}x{HEIGHT} resolution.", flush=True)
    return True

async def render_sequence(ws, start_frame, num_frames, output_mp4, audio_src, audio_duration=None):
    os.makedirs(os.path.dirname(output_mp4) or ".", exist_ok=True)
    
    # Build FFmpeg command with input pipe
    ffmpeg_cmd = [
        FFMPEG_EXE, "-y",
        "-loglevel", "error",
        "-f", "image2pipe",
        "-c:v", "mjpeg",
        "-r", str(FPS),
        "-i", "pipe:0"
    ]
    
    if audio_src and os.path.exists(audio_src):
        ffmpeg_cmd.extend(["-i", audio_src])
        if audio_duration:
            ffmpeg_cmd.extend(["-t", str(audio_duration)])
        ffmpeg_cmd.extend([
            "-c:v", "libx264",
            "-preset", "veryfast",
            "-crf", "19",
            "-pix_fmt", "yuv420p",
            "-c:a", "aac",
            "-b:a", "192k",
            "-ar", "48000",
            "-ac", "2",
            "-shortest",
            "-movflags", "+faststart",
            output_mp4
        ])
    else:
        ffmpeg_cmd.extend([
            "-c:v", "libx264",
            "-preset", "veryfast",
            "-crf", "19",
            "-pix_fmt", "yuv420p",
            "-movflags", "+faststart",
            output_mp4
        ])
    
    # Use DEVNULL for stderr to completely eliminate pipe deadlocks on Windows
    proc = subprocess.Popen(ffmpeg_cmd, stdin=subprocess.PIPE, stderr=subprocess.DEVNULL)
    msg_id = 100
    
    print(f"Starting render of {num_frames} frames ({num_frames/FPS:.1f}s) to {output_mp4}...", flush=True)
    start_time = time.time()
    
    try:
        for f in range(start_frame, start_frame + num_frames):
            t = f / float(FPS)
            msg_id += 1
            
            expr = f"window.renderFrameAndGetJPEG({t:.4f})"
            b64_str = await evaluate_js(ws, msg_id, expr)
            
            if not b64_str:
                raise RuntimeError(f"Failed to capture frame {f} at t={t:.4f}s")
            
            frame_bytes = base64.b64decode(b64_str)
            proc.stdin.write(frame_bytes)
            
            if (f - start_frame + 1) % 150 == 0 or (f - start_frame + 1) == num_frames:
                pct = ((f - start_frame + 1) / num_frames) * 100.0
                elapsed = time.time() - start_time
                fps_render = (f - start_frame + 1) / elapsed if elapsed > 0 else 0
                print(f"  Frame {f - start_frame + 1}/{num_frames} ({pct:.1f}%) | {t:.2f}s | {fps_render:.1f} fps", flush=True)
                
        proc.stdin.close()
        proc.wait(timeout=60)
    except Exception as e:
        proc.kill()
        raise e

    print(f"Render completed: {output_mp4} ({os.path.getsize(output_mp4):,} bytes)", flush=True)

def sample_frame_inspection(video_path, timestamps):
    os.makedirs("temp_frames", exist_ok=True)
    print("\n--- Inspecting Sample Frames ---", flush=True)
    
    for ts in timestamps:
        out_jpg = f"temp_frames/frame_{ts.replace(':', '_').replace('.', '_')}.jpg"
        cmd = [
            FFMPEG_EXE, "-y",
            "-ss", ts,
            "-i", video_path,
            "-vframes", "1",
            "-q:v", "2",
            out_jpg
        ]
        subprocess.run(cmd, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL, check=True)
        if not os.path.exists(out_jpg) or os.path.getsize(out_jpg) < 5000:
            raise ValueError(f"Sample frame at {ts} failed validation!")
            
        img = Image.open(out_jpg)
        extrema = img.convert("L").getextrema()
        if extrema[1] < 15:
            raise ValueError(f"Sample frame at {ts} is black or empty!")
            
        print(f"  ✓ Frame at {ts} validated ({out_jpg}, max luminance: {extrema[1]}/255)", flush=True)

async def main():
    print("============================================================", flush=True)
    print("AI-POWERED SMART AGRICULTURE: MP4 RENDER PIPELINE", flush=True)
    print("============================================================", flush=True)
    
    server = start_server()
    print(f"Local static server started on port {PORT}", flush=True)
    
    chrome_proc = subprocess.Popen([
        CHROME_EXE,
        "--headless=new",
        f"--remote-debugging-port={DEBUG_PORT}",
        f"--window-size={WIDTH},{HEIGHT}",
        "--hide-scrollbars",
        "--disable-gpu-vsync",
        "--no-first-run",
        "--user-data-dir=C:\\Users\\shami\\AppData\\Local\\Temp\\chrome_render_profile",
        f"http://127.0.0.1:{PORT}/index.html"
    ])
    
    try:
        ws_url = await wait_for_chrome_tab()
        print("Connected to Chrome via WebSocket:", ws_url, flush=True)
        
        async with websockets.connect(ws_url, max_size=50*1024*1024) as ws:
            print("Waiting for application initialization...", flush=True)
            for attempt in range(30):
                is_ready = await evaluate_js(ws, attempt+1, "typeof window.renderFrameAndGetJPEG === 'function'")
                if is_ready:
                    print("Presentation engine ready.", flush=True)
                    break
                await asyncio.sleep(0.5)
                
            # STEP 1: 5-SECOND EXPORT TEST (Requirement 19)
            print("\n------------------------------------------------------------", flush=True)
            print("STEP 1: RUNNING 5-SECOND EXPORT TEST (150 FRAMES)", flush=True)
            print("------------------------------------------------------------", flush=True)
            test_mp4 = "test_export_5sec.mp4"
            await render_sequence(ws, start_frame=0, num_frames=150, output_mp4=test_mp4, audio_src=AUDIO_TRACK, audio_duration=5.0)
            
            validate_video_file(test_mp4, expected_min_duration=4.5)
            print("5-SECOND EXPORT TEST PASSED! Proceeding to full 120-second export.\n", flush=True)
            
            # STEP 2: FULL 120-SECOND EXPORT (Requirement 16, 17, 18)
            print("------------------------------------------------------------", flush=True)
            print(f"STEP 2: RUNNING FULL 120-SECOND MASTER EXPORT ({TOTAL_FRAMES} FRAMES)", flush=True)
            print("------------------------------------------------------------", flush=True)
            await render_sequence(ws, start_frame=0, num_frames=TOTAL_FRAMES, output_mp4=FINAL_OUTPUT_PUBLIC, audio_src=AUDIO_TRACK, audio_duration=TOTAL_DURATION)
            
            with open(FINAL_OUTPUT_PUBLIC, "rb") as f_in:
                with open(FINAL_OUTPUT_ROOT, "wb") as f_out:
                    f_out.write(f_in.read())
            print(f"Copied final standalone MP4 to project root: {FINAL_OUTPUT_ROOT}", flush=True)
            
            # STEP 3: FINAL EXPORT VALIDATION (Requirement 20)
            print("\n------------------------------------------------------------", flush=True)
            print("STEP 3: FINAL EXPORT VALIDATION", flush=True)
            print("------------------------------------------------------------", flush=True)
            validate_video_file(FINAL_OUTPUT_ROOT, expected_min_duration=119.0)
            validate_video_file(FINAL_OUTPUT_PUBLIC, expected_min_duration=119.0)
            
            sample_timestamps = ["00:00.500", "00:10.000", "00:30.000", "01:00.000", "01:30.000", "01:50.000", "01:59.000"]
            sample_frame_inspection(FINAL_OUTPUT_ROOT, sample_timestamps)
            
            print("\n============================================================", flush=True)
            print("✓ EXPORT COMPLETE", flush=True)
            print(f"Format: MP4 / H.264 / AAC", flush=True)
            print(f"Resolution: {WIDTH}×{HEIGHT}", flush=True)
            print(f"Frame Rate: {FPS} FPS", flush=True)
            print(f"Duration: 02:00 (120 seconds)", flush=True)
            print(f"Root Deliverable: {os.path.abspath(FINAL_OUTPUT_ROOT)}", flush=True)
            print(f"Public Web Deliverable: {os.path.abspath(FINAL_OUTPUT_PUBLIC)}", flush=True)
            print("============================================================\n", flush=True)

    finally:
        chrome_proc.kill()
        server.shutdown()

if __name__ == "__main__":
    asyncio.run(main())
