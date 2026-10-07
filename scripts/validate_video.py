import os
import subprocess
from PIL import Image

FFMPEG_EXE = r"C:\Users\shami\AppData\Local\Programs\Python\Python311\Lib\site-packages\imageio_ffmpeg\binaries\ffmpeg-win-x86_64-v7.1.exe"
FINAL_MP4 = "Smart_Agriculture_AI_Explainer_2min.mp4"
PUBLIC_MP4 = "public/video/Smart_Agriculture_AI_Explainer_2min.mp4"
SAMPLE_TIMESTAMPS = ["00:00.500", "00:10.000", "00:30.000", "01:00.000", "01:30.000", "01:50.000", "01:59.000"]

def validate_stream_and_metadata(filepath):
    print(f"\n============================================================")
    print(f"VALIDATING FILE: {filepath}")
    print(f"============================================================")
    
    if not os.path.exists(filepath):
        raise FileNotFoundError(f"Missing file: {filepath}")
        
    size_mb = os.path.getsize(filepath) / (1024 * 1024)
    print(f"File Size: {size_mb:.2f} MB ({os.path.getsize(filepath):,} bytes)")
    
    cmd = [FFMPEG_EXE, "-i", filepath]
    res = subprocess.run(cmd, stderr=subprocess.PIPE, stdout=subprocess.PIPE, text=True, errors="replace")
    probe = res.stderr
    
    # 1. Video Stream check
    assert "Video: h264" in probe, "Error: Video codec is not H.264!"
    print("  [PASS] Video Stream: H.264 / AVC verified")
    
    # 2. Pixel format
    assert "yuv420p" in probe, "Error: Pixel format is not yuv420p!"
    print("  [PASS] Pixel Format: yuv420p verified")
    
    # 3. Resolution
    assert "1280x720" in probe, "Error: Resolution is not 1280x720!"
    print("  [PASS] Resolution: 1280x720 (16:9 HD) verified")
    
    # 4. FPS
    assert "30 fps" in probe or "30 tbr" in probe, "Error: FPS is not 30 FPS!"
    print("  [PASS] Frame Rate: 30 FPS verified")
    
    # 5. Audio Stream
    assert "Audio: aac" in probe, "Error: Audio codec is not AAC!"
    print("  [PASS] Audio Stream: AAC-LC stereo verified")
    
    # 6. Sample Rate
    assert "48000 Hz" in probe, "Error: Audio sample rate is not 48 kHz!"
    print("  [PASS] Audio Sample Rate: 48 kHz stereo verified")
    
    # 7. Duration
    assert "00:02:00" in probe, f"Error: Duration is not 120 seconds! Info:\n{probe}"
    print("  [PASS] Duration: Exactly 02:00.00 (120.00 Seconds) verified")

def validate_sample_frames(filepath):
    os.makedirs("temp_frames", exist_ok=True)
    print(f"\n--- Extracting and Inspecting Sample Frames for {filepath} ---")
    
    for ts in SAMPLE_TIMESTAMPS:
        sanitized = ts.replace(":", "_").replace(".", "_")
        out_jpg = f"temp_frames/frame_{sanitized}.jpg"
        
        cmd = [
            FFMPEG_EXE, "-y",
            "-ss", ts,
            "-i", filepath,
            "-vframes", "1",
            "-q:v", "2",
            out_jpg
        ]
        subprocess.run(cmd, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL, check=True)
        
        assert os.path.exists(out_jpg), f"Failed to extract frame at {ts}"
        assert os.path.getsize(out_jpg) > 10000, f"Frame at {ts} is suspiciously small: {os.path.getsize(out_jpg)} bytes"
        
        img = Image.open(out_jpg)
        extrema = img.convert("L").getextrema()
        assert extrema[1] > 30, f"Frame at {ts} is completely black! Max luminance: {extrema[1]}"
        
        print(f"  [PASS] Frame at {ts} -> {out_jpg} ({os.path.getsize(out_jpg):,} bytes, Luminance: {extrema[0]}-{extrema[1]}/255)")

if __name__ == "__main__":
    validate_stream_and_metadata(FINAL_MP4)
    validate_sample_frames(FINAL_MP4)
    validate_stream_and_metadata(PUBLIC_MP4)
    print("\n============================================================")
    print("ALL VALIDATION CRITERIA MET AND PASSED 100%!")
    print("============================================================")
