#!/usr/bin/env python3
"""
Visual Regression Harness for Cinematic 3D Scene Reconstruction

Compares Playwright screenshots against reference frames using
structural similarity (SSIM) and pixel-level diffs.

Usage:
    python visual_regression.py --reference reference-capture/screenshots/desktop_hero.png
    python visual_regression.py --reference reference-capture/screenshots/ --build website/public/index.html
    python visual_regression.py --all

Outputs:
    - visual_diff.png  (highlighted pixel differences)
    - regression_report.json  (SSIM scores per comparison)
"""

import argparse
import json
import os
import sys
from pathlib import Path

import cv2
import numpy as np
from skimage.metrics import structural_similarity as ssim
from PIL import Image


def load_image(path):
    """Load an image file as a numpy array in RGB order."""
    img = cv2.imread(str(path))
    if img is None:
        raise ValueError(f"Cannot load image: {path}")
    return cv2.cvtColor(img, cv2.COLOR_BGR2RGB)


def compare_images(reference_path, actual_path, output_diff=None):
    """
    Compare two images using SSIM and generate a visual diff.

    Returns dict with SSIM score, MSE, and diff image path.
    """
    ref = load_image(reference_path)
    act = load_image(actual_path)

    # Ensure same dimensions
    h, w = ref.shape[:2]
    act_resized = cv2.resize(act, (w, h))

    # Convert to grayscale for SSIM
    ref_gray = cv2.cvtColor(ref, cv2.COLOR_RGB2GRAY)
    act_gray = cv2.cvtColor(act_resized, cv2.COLOR_RGB2GRAY)

    # Calculate SSIM
    score, diff = ssim(ref_gray, act_gray, full=True, data_range=255)
    diff = (diff * 255).astype(np.uint8)

    # Calculate MSE
    mse = np.mean((ref_gray.astype(float) - act_gray.astype(float)) ** 2)

    # Generate color diff visualization
    if output_diff:
        # Threshold the diff map
        threshold = 0.05  # SSIM diff threshold
        diff_binary = (1.0 - score_map_to_binary(act_gray, ref_gray, threshold))

        # Create overlay: red pixels where different
        overlay = act_resized.copy()
        overlay[diff_binary > 0] = [255, 0, 0]  # Red highlights

        # Blend original with overlay
        result = cv2.addWeighted(act_resized, 0.7, overlay, 0.3, 0)
        cv2.imwrite(str(output_diff), cv2.cvtColor(result, cv2.COLOR_RGB2BGR))

    return {
        "ssim": float(score),
        "mse": float(mse),
        "reference": str(reference_path),
        "actual": str(actual_path),
        "diff_image": str(output_diff) if output_diff else None,
        "dimensions": {"w": w, "h": h},
    }


def score_map_to_binary(img1, img2, threshold):
    """Element-wise SSIM approximation for thresholding."""
    diff_map = np.abs(img1.astype(float) - img2.astype(float))
    max_val = np.max(diff_map) if np.max(diff_map) > 0 else 1
    return (diff_map / max_val) < (1.0 - threshold)


def batch_compare(reference_dir, actual_dir, output_dir="regression_output"):
    """
    Compare all matching filenames in reference_dir and actual_dir.
    Files are matched by basename (e.g., 'desktop_hero.png').
    """
    ref_dir = Path(reference_dir)
    act_dir = Path(actual_dir)
    out_dir = Path(output_dir)
    out_dir.mkdir(parents=True, exist_ok=True)

    results = []
    ref_files = list(ref_dir.glob("*.png")) + list(ref_dir.glob("*.jpg"))

    for ref_path in ref_files:
        actual_path = act_dir / ref_path.name
        if not actual_path.exists():
            print(f"  SKIP: no actual image for {ref_path.name}")
            continue

        diff_path = out_dir / f"diff_{ref_path.stem}.png"
        result = compare_images(ref_path, actual_path, diff_path)
        results.append(result)

        status = "PASS" if result["ssim"] > 0.95 else "WARN" if result["ssim"] > 0.85 else "FAIL"
        print(f"  {status}: {ref_path.name}  SSIM={result['ssim']:.4f}  MSE={result['mse']:.2f}")

    # Write report
    report_path = out_dir / "regression_report.json"
    with open(report_path, "w") as f:
        json.dump({"comparisons": results, "summary": {
            "total": len(results),
            "pass": sum(1 for r in results if r["ssim"] > 0.95),
            "warn": sum(1 for r in results if 0.85 < r["ssim"] <= 0.95),
            "fail": sum(1 for r in results if r["ssim"] <= 0.85),
        }}, f, indent=2)

    print(f"\nReport: {report_path}")
    return results


def extract_frames(video_path, output_dir, fps=2):
    """Extract frames from a video file using FFmpeg (via subprocess)."""
    import subprocess
    output_dir = Path(output_dir)
    output_dir.mkdir(parents=True, exist_ok=True)

    cmd = [
        "ffmpeg", "-i", str(video_path),
        "-vf", f"fps={fps}",
        str(output_dir / "frame_%04d.png"),
        "-y", "-loglevel", "error",
    ]
    result = subprocess.run(cmd, capture_output=True, text=True)
    if result.returncode != 0:
        print(f"FFmpeg error: {result.stderr}")
        return []

    frames = sorted(output_dir.glob("frame_*.png"))
    print(f"Extracted {len(frames)} frames to {output_dir}")
    return frames


def detect_scene_changes(video_path, output_dir, threshold=0.08):
    """Detect scene changes using FFmpeg."""
    import subprocess
    output_dir = Path(output_dir)
    output_dir.mkdir(parents=True, exist_ok=True)

    cmd = [
        "ffmpeg", "-i", str(video_path),
        "-vf", f"select='gt(scene,{threshold})',showinfo",
        "-vsync", "vfr",
        str(output_dir / "scene_%04d.png"),
        "-y", "-loglevel", "error",
    ]
    result = subprocess.run(cmd, capture_output=True, text=True)
    if result.returncode != 0:
        print(f"FFmpeg error: {result.stderr}")
        return []

    scenes = sorted(output_dir.glob("scene_*.png"))
    print(f"Detected {len(scenes)} scene changes in {output_dir}")
    return scenes


def dominant_colors(image_path, num_colors=8):
    """Extract dominant colors from an image."""
    img = Image.open(image_path).convert("RGB")
    img = img.resize((150, 150))  # Small for performance
    pixels = np.array(img).reshape(-1, 3)

    # K-means using OpenCV
    pixels = np.float32(pixels)
    criteria = (cv2.TERM_CRITERIA_EPS + cv2.TERM_CRITERIA_MAX_ITER, 20, 1.0)
    _, labels, palette = cv2.kmeans(
        pixels, num_colors, None, criteria, 10, cv2.KMEANS_RANDOM_CENTERS
    )

    # Count pixels per cluster
    counts = np.bincount(labels.flatten())
    total = counts.sum()
    colors = []
    for i in range(num_colors):
        color = palette[i].astype(int)
        hex_color = "#{:02x}{:02x}{:02x}".format(*color)
        colors.append({
            "rgb": color.tolist(),
            "hex": hex_color,
            "percentage": float(counts[i] / total * 100),
        })

    return sorted(colors, key=lambda x: x["percentage"], reverse=True)


def main():
    parser = argparse.ArgumentParser(description="Visual Regression Harness")
    parser.add_argument("--reference", help="Reference image or directory")
    parser.add_argument("--actual", help="Actual image or directory to compare")
    parser.add_argument("--output", default="regression_output", help="Output directory")
    parser.add_argument("--video", help="Extract frames from video")
    parser.add_argument("--fps", type=int, default=2, help="Frames per second for extraction")
    parser.add_argument("--all", action="store_true", help="Run full pipeline")
    parser.add_argument("--palette", help="Extract dominant colors from image")

    args = parser.parse_args()

    if args.all:
        print("Full visual regression pipeline not yet implemented in CLI mode.")
        print("Use specific flags: --reference, --video, --palette")
        return

    if args.palette:
        colors = dominant_colors(args.palette)
        print(f"Dominant colors in {args.palette}:")
        for c in colors:
            print(f"  {c['hex']}  {c['rgb']}  {c['percentage']:.1f}%")
        return

    if args.video:
        base = Path(args.video).parent
        extract_frames(args.video, base / "frames", fps=args.fps)
        detect_scene_changes(args.video, base / "scenes")
        return

    if args.reference and args.actual:
        ref = Path(args.reference)
        act = Path(args.actual)

        if ref.is_dir() and act.is_dir():
            batch_compare(ref, act, args.output)
        elif ref.is_file() and act.is_file():
            diff = Path(args.output) / f"diff_{ref.stem}.png"
            Path(args.output).mkdir(parents=True, exist_ok=True)
            result = compare_images(ref, act, diff)
            status = "PASS" if result["ssim"] > 0.95 else "WARN" if result["ssim"] > 0.85 else "FAIL"
            print(f"{status}: SSIM={result['ssim']:.4f} MSE={result['mse']:.2f}")
            print(f"Diff: {diff}")
        else:
            print("ERROR: reference and actual must both be files or both be directories")
            return 1

    return 0


if __name__ == "__main__":
    sys.exit(main())
