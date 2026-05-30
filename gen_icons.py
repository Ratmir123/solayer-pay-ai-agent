#!/usr/bin/env python3
"""Generator for the glassy-emerald carousel category icons (gpt-image-1).

Companion to gen_images.py. Where gen_images.py makes photographic hero shots,
this makes a *matching set* of premium 3D glass icons — one per food/service
category — on a fully transparent background, so they can replace the plain
emoji in the idle carousel chips.

Style: translucent frosted+glossy glass, mint→deep-emerald gradient, white
frosted core, soft studio lighting. Unified material/lighting across the whole
set; only the SHAPE changes per category (per the user's brief).

The API key is read from OPENAI_API_KEY ONLY (never stored here). Run:
  $env:OPENAI_API_KEY="sk-..."; python gen_icons.py

Outputs images/icon-<key>.png (square, transparent). Existing files are skipped
so reruns are cheap. Stdlib only (urllib), like serve.py / gen_images.py.
"""
import base64
import json
import os
import sys
import time
import urllib.error
import urllib.request

HERE = os.path.dirname(os.path.abspath(__file__))
OUT = os.path.join(HERE, "images")
URL = "https://api.openai.com/v1/images/generations"
MODEL = os.environ.get("OPENAI_IMAGE_MODEL", "gpt-image-1")
SIZE = "1024x1024"          # square — carousel chip icons
QUALITY = "high"            # crisp alpha edges matter for tiny icons; only 9 imgs

# The shared "glass set" style. Kept identical across every icon so the nine
# read as one cohesive family — same material, same light, same gradient, same
# camera. Only the BASE (the shape) differs. Transparent background is requested
# both in the prompt and via the API `background` param for a clean alpha cutout.
SUFFIX = (
    ", rendered as ONE single premium 3D glass object floating on a FULLY TRANSPARENT "
    "background — no tile, no rounded-square plaque, no card, no background panel, no frame, "
    "no ground, no shadow; ONLY the isolated object with a clean alpha cutout. Material: "
    "glossy translucent glass in bright mint and emerald green with luminous white frosted "
    "highlights (white-mint #eafff7 and #b9ffe6, emerald #00ffa3 fading to #084d3e), soft "
    "internal glow, crisp specular highlights, gentle refraction, smooth rounded minimal "
    "sculpted form; bright and glossy so the shape reads clearly. Centered, straight-on front "
    "three-quarter view. Part of a matching set of glass icons sharing ONE consistent glass "
    "material, mint-white-and-emerald palette and studio lighting across the whole set — no "
    "other colours, no red, no orange, no yellow, no brown, no blue. High-end glassmorphism "
    "app icon, octane render, ultra-crisp clean edges. No text, no words, no logos, no background."
)

# Per-category SHAPE only — short and iconic so the shared SUFFIX dominates the
# look and keeps the family coherent.
ICON_PROMPTS = {
    "pizza":     "A single triangular slice of pizza with a few small round topping dots",
    "coffee":    "A tall take-away coffee cup with a domed lid and a sleeve, a little steam curl",
    "sushi":     "A single piece of nigiri sushi: an oval rice base topped with one smooth glossy fish fillet",
    "burger":    "A neat stacked cheeseburger: top bun, melting cheese, a patty, a leaf of lettuce, bottom bun",
    "chinese":   "A folded Chinese takeout oyster-pail box with a pair of chopsticks resting across the top",
    "dessert":   "A cute cupcake with a tall swirl of frosting and a single round cherry on top",
    "ride":      "A sleek rounded compact car seen from a three-quarter front angle",
    "groceries": "A rounded paper grocery bag with a leafy vegetable top and a baguette poking out",
    "hotels":    "A simple modern multi-storey hotel building with neat rows of windows and a small entrance awning",
}


def gen(key, prompt, dest):
    body = json.dumps({
        "model": MODEL,
        "prompt": prompt + SUFFIX,
        "size": SIZE,
        "quality": QUALITY,
        "background": "transparent",   # clean alpha cutout for the chips
        "output_format": "png",        # png keeps the transparency
        "n": 1,
    }).encode("utf-8")
    req = urllib.request.Request(URL, data=body, method="POST")
    req.add_header("Authorization", "Bearer " + key)
    req.add_header("Content-Type", "application/json")
    with urllib.request.urlopen(req, timeout=240) as r:
        data = json.loads(r.read().decode("utf-8", "replace"))
    b64 = data["data"][0]["b64_json"]
    with open(dest, "wb") as f:
        f.write(base64.b64decode(b64))
    return dest


def main():
    key = os.environ.get("OPENAI_API_KEY")
    if not key:
        print("ERROR: OPENAI_API_KEY not set in env", file=sys.stderr)
        sys.exit(1)
    os.makedirs(OUT, exist_ok=True)
    print("ICONS  model=%s size=%s quality=%s transparent -> %s" % (MODEL, SIZE, QUALITY, OUT))
    ok, fail = 0, 0

    for cat, base in ICON_PROMPTS.items():
        dest = os.path.join(OUT, "icon-%s.png" % cat)
        label = "icon-" + cat
        if os.path.exists(dest) and os.path.getsize(dest) > 1000:
            print("skip  %-18s (exists)" % label)
            ok += 1
            continue
        t0 = time.time()
        try:
            gen(key, base, dest)
            print("ok    %-18s %.1fs" % (label, time.time() - t0))
            ok += 1
        except urllib.error.HTTPError as e:
            detail = e.read().decode("utf-8", "replace")[:500]
            print("FAIL  %-18s HTTP %s: %s" % (label, e.code, detail), file=sys.stderr)
            fail += 1
        except Exception as e:  # noqa: BLE001
            print("FAIL  %-18s %s" % (label, e), file=sys.stderr)
            fail += 1

    print("done: %d ok, %d failed" % (ok, fail))
    sys.exit(0 if fail == 0 else 2)


if __name__ == "__main__":
    main()
