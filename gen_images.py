#!/usr/bin/env python3
"""One-shot generator for premium category hero images via the OpenAI Images API.

The API key is read from the OPENAI_API_KEY environment variable ONLY — it is
never stored in this file. Run:  $env:OPENAI_API_KEY="sk-..."; python gen_images.py

Outputs images/cat-<key>.png for each food/service category. Existing files are
skipped so reruns are cheap. Uses only the stdlib (urllib), like serve.py.
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
SIZE = "1536x1024"      # landscape — matches the 16:10 / 16:8 hero cards
QUALITY = "medium"      # "медиум качество"

SUFFIX = (
    " Ultra-realistic premium editorial food photography, shot on 35mm, shallow "
    "depth of field, cinematic color grading, soft moody low-key lighting on a "
    "dark background, a subtle emerald-green ambient rim light, appetizing, "
    "high-end restaurant menu hero shot. No text, no logos, no watermark, no people."
)

PROMPTS = {
    "pizza": "An artisan wood-fired pepperoni pizza with fresh basil, bubbling melted mozzarella and hot honey, on a dark slate board, faint steam rising.",
    "coffee": "An iced oat-milk latte in a clear glass with layered cream and espresso, condensation droplets, on a dark cafe counter beside roasted beans.",
    "sushi": "A salmon-avocado sushi roll set beautifully plated on dark ceramic with pickled ginger, wasabi and chopsticks, glossy fresh fish.",
    "burger": "A gourmet double smash cheeseburger with dripping melted cheese, caramelised onions and a side of crispy golden fries on dark stone.",
    "chinese": "A dark bowl of beef chow fun wide noodles with scallions and bean sprouts, chopsticks lifting noodles, gentle steam, glossy sauce.",
    "dessert": "A tiramisu slice dusted with cocoa beside brown-butter cookies and a macaron, on dark marble, elegant patisserie styling.",
    "ride": "A sleek black luxury electric sedan parked on a wet city street at night, glowing neon reflections on the paintwork, cinematic.",
    "groceries": "A fresh premium grocery haul arranged on dark wood — organic produce, farm eggs, a sourdough loaf, avocados and bottled milk.",
}


def gen(key, cat, prompt):
    body = json.dumps({
        "model": MODEL,
        "prompt": prompt + SUFFIX,
        "size": SIZE,
        "quality": QUALITY,
        "n": 1,
    }).encode("utf-8")
    req = urllib.request.Request(URL, data=body, method="POST")
    req.add_header("Authorization", "Bearer " + key)
    req.add_header("Content-Type", "application/json")
    with urllib.request.urlopen(req, timeout=180) as r:
        data = json.loads(r.read().decode("utf-8", "replace"))
    b64 = data["data"][0]["b64_json"]
    dest = os.path.join(OUT, "cat-%s.png" % cat)
    with open(dest, "wb") as f:
        f.write(base64.b64decode(b64))
    return dest


def main():
    key = os.environ.get("OPENAI_API_KEY")
    if not key:
        print("ERROR: OPENAI_API_KEY not set in env", file=sys.stderr)
        sys.exit(1)
    os.makedirs(OUT, exist_ok=True)
    print("model=%s size=%s quality=%s -> %s" % (MODEL, SIZE, QUALITY, OUT))
    ok, fail = 0, 0
    for cat, prompt in PROMPTS.items():
        dest = os.path.join(OUT, "cat-%s.png" % cat)
        if os.path.exists(dest) and os.path.getsize(dest) > 1000:
            print("skip  %-10s (exists)" % cat)
            ok += 1
            continue
        t0 = time.time()
        try:
            gen(key, cat, prompt)
            print("ok    %-10s %.1fs" % (cat, time.time() - t0))
            ok += 1
        except urllib.error.HTTPError as e:
            detail = e.read().decode("utf-8", "replace")[:500]
            print("FAIL  %-10s HTTP %s: %s" % (cat, e.code, detail), file=sys.stderr)
            fail += 1
        except Exception as e:  # noqa: BLE001
            print("FAIL  %-10s %s" % (cat, e), file=sys.stderr)
            fail += 1
    print("done: %d ok, %d failed" % (ok, fail))
    sys.exit(0 if fail == 0 else 2)


if __name__ == "__main__":
    main()
