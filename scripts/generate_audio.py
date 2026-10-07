import asyncio
import os
import wave
import math
import struct
import subprocess
import edge_tts

FFMPEG_EXE = r"C:\Users\shami\AppData\Local\Programs\Python\Python311\Lib\site-packages\imageio_ffmpeg\binaries\ffmpeg-win-x86_64-v7.1.exe"

SCENES = [
    (0, "Welcome to our AI-powered smart agriculture monitoring and crop yield prediction system. This solution combines IoT sensors, intelligent analysis, and automated irrigation to make farming smarter and more efficient."),
    (12, "The system uses an ESP32 controller together with soil moisture, temperature and humidity, pH, and NPK sensors. A MAX485 interface provides reliable RS485 communication for the NPK sensor."),
    (24, "The sensors continuously monitor the farm environment. Soil moisture measures water availability, the DHT22 measures temperature and humidity, the pH sensor measures soil acidity, and the NPK sensor measures essential soil nutrients."),
    (36, "The NPK sensor communicates using the RS485 protocol. The MAX485 module interfaces this communication with the ESP32, allowing the nutrient data to be collected by the controller."),
    (48, "The ESP32 collects and processes the sensor readings, combining the information into a unified view of the farm's current condition."),
    (60, "The processed information is transmitted wirelessly through Wi-Fi to the software dashboard, where the farm can be monitored in real time."),
    (72, "The dashboard presents real-time sensor readings through clear indicators and graphs, allowing the condition of the crop environment to be monitored easily."),
    (84, "The collected agricultural data is then analyzed intelligently to evaluate crop health and estimate potential crop yield, helping farmers make more informed decisions."),
    (96, "When soil moisture falls below the required threshold, the ESP32 detects the condition and automatically activates the irrigation system."),
    (108, "Once sufficient moisture is restored, the pump switches off automatically. This creates a complete intelligent monitoring and irrigation cycle for smarter and more efficient agriculture.")
]

def generate_ambient_music_wav(filename, duration_sec=120, sample_rate=48000):
    """
    Synthesize an elegant, warm ambient technological background music track
    with smooth arpeggios, gentle pads, subtle chords, and a graceful fade out at 120s.
    """
    total_samples = int(duration_sec * sample_rate)
    chords = [
        [220.0, 261.63, 329.63, 392.0],  # Am7
        [174.61, 220.0, 261.63, 329.63], # Fmaj7
        [130.81, 164.81, 196.0, 246.94], # Cmaj7
        [196.0, 246.94, 293.66, 349.23]  # G7
    ]
    chord_len = 6.0 # seconds per chord
    
    with wave.open(filename, 'w') as wf:
        wf.setnchannels(2)
        wf.setsampwidth(2)
        wf.setframerate(sample_rate)
        
        frames = bytearray()
        chunk_size = 48000
        
        for i in range(0, total_samples, chunk_size):
            chunk_frames = bytearray()
            current_chunk = min(chunk_size, total_samples - i)
            for j in range(current_chunk):
                idx = i + j
                t = idx / sample_rate
                
                # Master fade in & out
                fade = 1.0
                if t < 3.0:
                    fade = t / 3.0
                elif t > 116.0:
                    fade = max(0.0, (120.0 - t) / 4.0)
                
                # Chord cycle
                chord_idx = int((t % (len(chords) * chord_len)) / chord_len)
                cur_chord = chords[chord_idx]
                
                # Pad synth: warm smooth sines with subtle detuning
                pad = 0.0
                for f in cur_chord:
                    pad += math.sin(2 * math.pi * f * t) * 0.15
                    pad += math.sin(2 * math.pi * (f * 1.002) * t) * 0.10
                    pad += math.sin(2 * math.pi * (f * 0.5) * t) * 0.12 # sub octave
                
                # Gentle rhythmic arpeggio (16th notes feel)
                arp_rate = 4.0 # notes per second
                note_idx = int(t * arp_rate) % len(cur_chord)
                arp_freq = cur_chord[note_idx] * 2.0
                arp_env = math.exp(-((t * arp_rate) % 1.0) * 3.5)
                arp = math.sin(2 * math.pi * arp_freq * t) * 0.08 * arp_env
                
                # Subtle high sparkle
                sparkle = math.sin(2 * math.pi * (cur_chord[2] * 4.0) * t) * 0.02 * math.sin(t * 0.8)
                
                # Stereo separation
                left = (pad * 0.6 + arp * 0.7 + sparkle * 0.5) * fade * 0.22
                right = (pad * 0.65 + arp * 0.4 + sparkle * 0.8) * fade * 0.22
                
                s_left = int(max(-32767, min(32767, left * 32767)))
                s_right = int(max(-32767, min(32767, right * 32767)))
                chunk_frames.extend(struct.pack('<hh', s_left, s_right))
            wf.writeframes(chunk_frames)

async def generate_narration():
    os.makedirs('temp_audio', exist_ok=True)
    os.makedirs('public/audio', exist_ok=True)
    voice = "en-US-GuyNeural"
    
    tasks = []
    for i, (start_time, text) in enumerate(SCENES):
        out_f = f"temp_audio/scene_{i+1}.mp3"
        comm = edge_tts.Communicate(text, voice, rate="+2%")
        tasks.append(comm.save(out_f))
    
    await asyncio.gather(*tasks)
    print("All scene TTS audio clips downloaded.")

def build_timeline_audio():
    # 1. Generate ambient music
    music_wav = "temp_audio/music.wav"
    print("Generating ambient background music...")
    generate_ambient_music_wav(music_wav, duration_sec=120)
    
    # 2. Build FFmpeg command to assemble narration with exact start delays
    # Inputs: 10 narration files + 1 music file
    # scene_1: starts at 0.5s
    # scene_2: starts at 12.5s
    # scene_3: starts at 24.5s
    # scene_4: starts at 36.5s
    # scene_5: starts at 48.5s
    # scene_6: starts at 60.5s
    # scene_7: starts at 72.5s
    # scene_8: starts at 84.5s
    # scene_9: starts at 96.5s
    # scene_10: starts at 108.5s
    
    cmd = [FFMPEG_EXE, "-y"]
    for i in range(10):
        cmd.extend(["-i", f"temp_audio/scene_{i+1}.mp3"])
    cmd.extend(["-i", music_wav])
    
    # Filter complex
    filter_parts = []
    for i, (start_time, _) in enumerate(SCENES):
        delay_ms = int((start_time + 0.4) * 1000)
        filter_parts.append(f"[{i}:a]adelay={delay_ms}|{delay_ms},volume=1.0[n{i}];")
    
    concat_inputs = "".join([f"[n{i}]" for i in range(10)])
    filter_parts.append(f"{concat_inputs}amix=inputs=10:dropout_transition=0:normalize=0[narration];")
    # Music is input 10
    filter_parts.append("[10:a]volume=0.35[bgm];")
    filter_parts.append("[narration][bgm]amix=inputs=2:dropout_transition=0:normalize=0,aformat=sample_fmts=fltp:sample_rates=48000:channel_layouts=stereo,atrim=0:120[outa]")
    
    full_filter = "".join(filter_parts)
    
    out_soundtrack = "public/audio/soundtrack.mp3"
    out_soundtrack_aac = "public/audio/soundtrack.m4a"
    
    run_cmd = cmd + [
        "-filter_complex", full_filter,
        "-map", "[outa]",
        "-t", "120",
        "-b:a", "192k",
        out_soundtrack
    ]
    
    print("Running FFmpeg audio mix...")
    subprocess.run(run_cmd, check=True)
    
    # Also generate bgm.mp3 and narration.mp3 for standalone player flexibility
    bgm_cmd = [
        FFMPEG_EXE, "-y",
        "-i", music_wav,
        "-t", "120",
        "-b:a", "160k",
        "public/audio/bgm.mp3"
    ]
    subprocess.run(bgm_cmd, check=True)
    
    # Also pure narration track
    filter_narr = "".join([f"[{i}:a]adelay={int((start_time+0.4)*1000)}|{int((start_time+0.4)*1000)}[n{i}];" for i, (start_time, _) in enumerate(SCENES)])
    filter_narr += "".join([f"[n{i}]" for i in range(10)]) + "amix=inputs=10:dropout_transition=0:normalize=0,atrim=0:120[outnar]"
    narr_cmd = [FFMPEG_EXE, "-y"]
    for i in range(10):
        narr_cmd.extend(["-i", f"temp_audio/scene_{i+1}.mp3"])
    narr_cmd.extend([
        "-filter_complex", filter_narr,
        "-map", "[outnar]",
        "-t", "120",
        "-b:a", "160k",
        "public/audio/narration.mp3"
    ])
    subprocess.run(narr_cmd, check=True)
    print("Soundtrack and audio stems generated successfully in public/audio/")

if __name__ == "__main__":
    asyncio.run(generate_narration())
    build_timeline_audio()
