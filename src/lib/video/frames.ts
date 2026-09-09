import { execFile } from "node:child_process";
import { mkdtemp, readFile, readdir, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import { promisify } from "node:util";
import ffmpegPath from "ffmpeg-static";

const execFileAsync = promisify(execFile);

const MAX_FRAMES = 8;
const FRAME_INTERVAL_SECONDS = 2;

export interface ExtractedFrame {
  timestampSeconds: number;
  base64: string;
}

// Samples evenly-spaced frames without needing ffprobe/duration: fps=1/2
// pulls one frame every 2s, capped at 8 frames — enough to see how a
// typical 15-90s reel evolves without an extra probing step or dependency.
export async function extractFrames(videoPath: string): Promise<ExtractedFrame[]> {
  if (!ffmpegPath) {
    throw new Error("ffmpeg binary not available for this platform (ffmpeg-static returned null)");
  }

  const workDir = await mkdtemp(path.join(tmpdir(), "draft-frames-"));
  try {
    await execFileAsync(ffmpegPath, [
      "-i",
      videoPath,
      "-vf",
      `fps=1/${FRAME_INTERVAL_SECONDS},scale=480:-1`,
      "-frames:v",
      String(MAX_FRAMES),
      "-q:v",
      "3",
      path.join(workDir, "frame-%02d.jpg"),
    ]);

    const files = (await readdir(workDir)).filter((f) => f.endsWith(".jpg")).sort();
    const frames: ExtractedFrame[] = [];
    for (const [index, file] of files.entries()) {
      const buffer = await readFile(path.join(workDir, file));
      frames.push({
        timestampSeconds: index * FRAME_INTERVAL_SECONDS,
        base64: buffer.toString("base64"),
      });
    }
    return frames;
  } finally {
    await rm(workDir, { recursive: true, force: true });
  }
}
