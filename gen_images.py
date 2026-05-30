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
    "hotels": "A modern upscale hotel building exterior in the early evening, warm glowing lobby windows and a welcoming lit entrance framed by greenery, architectural real-estate photography.",
}

# Per-store hero shots. Each prompt depicts that store's signature item with a
# distinct angle / plating / props so the 3 stores per category never look cloned.
STORE_PROMPTS = {
    # --- pizza ---
    "pizza-joes": "A huge New York-style pepperoni pizza slice held up from a whole pie, grease glistening, curled pepperoni cups, stringy melted mozzarella, top-down 3/4 angle on a dark steel pizza pan with a worn wooden peel behind.",
    "pizza-tonys": "A whole Margherita pizza with charred leopard-spotted crust from a brick oven, torn fresh basil leaves, milky buffalo mozzarella pools and a drizzle of olive oil, shot top-down on a dark cast-iron tray with scattered basil and a small bowl of sea salt.",
    "pizza-crust": "A single melty cheese pizza slice on a stacked pair of crinkled paper plates beside a frosty cola can, classic combo styling, side three-quarter angle on a dark diner counter, cheese pull mid-air.",

    # --- sushi ---
    "sushi-tokyo": "A precise salmon-avocado roll set arranged in a curved line on a long dark slate plate, glossy salmon, bright green avocado, pickled ginger rosette and a small mound of wasabi, chopsticks resting on a black ceramic rest, overhead shot.",
    "sushi-edomae": "An 8-piece omakase nigiri selection on a polished dark wood board — toro, salmon, uni gunkan, scallop with yuzu zest, ikura, eel with brushed tare — soft glints on each piece, intimate close-up angle.",
    "sushi-wabi": "A spicy tuna roll with a fiery sriracha-mayo drizzle and scattered tobiko, plated next to a small dark bowl of steaming miso soup with floating wakame and tofu cubes, side angle on dark stone, moody steam.",

    # --- coffee ---
    "coffee-beanlab": "A tall iced oat-milk latte in a clear glass, distinct espresso and oat-milk layers with a swirl of crema melting into the ice, condensation droplets, on a dark concrete cafe counter beside a brass tamper and scattered roasted beans.",
    "coffee-verve": "A perfect cortado in a small heavy glass cup with caramel crema and tight latte-art heart, paired with a single almond biscotti on a dark ceramic saucer, overhead flat-lay on a dark walnut tabletop.",
    "coffee-daydream": "A maple cold brew in a stout amber glass jar with a slow swirl of pure maple syrup dissolving into the dark coffee, a single ice sphere and a thin twig of cinnamon resting on top, side macro angle on dark slate.",

    # --- ride (luxury black EV / neon night, no food) ---
    "ride-solana": "A sleek black luxury electric sedan parked on a rain-slicked downtown street at night, glowing emerald and magenta neon reflections streaking across the wet paintwork and asphalt, low front three-quarter cinematic angle.",
    "ride-metrolift": "A clean black premium ride-share crossover EV waiting at a softly lit night curb, two interior passenger silhouette outlines barely visible through tinted rear windows, warm street-lamp glow, side-on cinematic shot on a wet city street.",
    "ride-ridenow": "A blacked-out luxury SUV with chrome accents idling under a concrete overpass at night, headlights cutting through faint mist, deep gloss paint, dramatic low rear three-quarter hero angle, cinematic dark mood.",

    # --- groceries ---
    "groceries-freshcart": "A tight composition of a carton of farm-fresh brown eggs (one cracked open beside it), a bottle of cold whole milk and a rustic sourdough boule with a flour-dusted ear, arranged on a dark oak board, overhead flat-lay.",
    "groceries-greenbasket": "An open woven dark wicker basket overflowing with organic produce — heirloom tomatoes, rainbow carrots with greens, a bunch of kale, a fennel bulb and lemons — on a dark linen cloth, soft side light, slight three-quarter angle.",
    "groceries-cornermart": "A neat essentials bundle on dark stone — a small loaf of bread, a glass bottle of milk, a wedge of cheddar, a paper bag of pasta, two apples and a roll of butter — clean grid-like flat-lay, paper-bag textures.",

    # --- burger ---
    "burger-smash": "A double smash burger with two crispy lacy-edged patties, melted American cheese cascading over the sides, pickles peeking out, a soft potato bun pressed slightly, served on dark parchment with a generous pile of golden shoestring fries, side hero angle.",
    "burger-bros": "A towering bacon cheeseburger combo — thick beef patty, crispy bacon strips, melted cheddar, lettuce and tomato in a glossy brioche bun — beside a paper cup of cola and onion rings, on a dark diner tray, three-quarter angle.",
    "burger-char": "A refined wagyu burger with marbled patty, a dark glossy bun stamped with a faint sear, a swipe of truffle aioli and shaved black truffle on top, plated on a dark slate slab beside a tiny ramekin of aioli, intimate close-up.",

    # --- chinese ---
    "chinese-dragon": "A dark ceramic plate of glossy beef chow fun wide rice noodles with charred wok-hei edges, scallions and bean sprouts, chopsticks lifting strands mid-air, a side basket of golden crispy spring rolls with a dipping sauce, gentle steam.",
    "chinese-sichuan": "A dark stone bowl of fiery mapo tofu — silken tofu cubes in glossy red chili-oil sauce flecked with Sichuan peppercorns and minced beef, scallions on top — beside a smaller bowl of fluffy jasmine rice, overhead angle, glistening surface.",
    "chinese-lucky": "A classic orange chicken combo — crispy battered chicken pieces in glossy candied orange sauce with sesame seeds and orange zest curls, served over a mound of steamed white rice in a black takeout-style bowl, three-quarter angle.",

    # --- dessert ---
    "dessert-sugarlab": "A stack of three thick brown-butter chocolate-chunk cookies with crackled tops, gooey molten chocolate puddles, flaky sea-salt flakes on top, one cookie broken open showing a soft chewy center, dark wood backdrop, intimate macro shot.",
    "dessert-frost": "A perfect swirl of black-sesame soft-serve in a dark waffle cone, glossy charcoal-grey ice cream with visible sesame speckles, a single edible gold flake on the peak, held against a dark gradient background, low side angle.",
    "dessert-madeleine": "An elegant tiramisu slice with neat espresso-soaked ladyfinger layers, mascarpone cream and a heavy cocoa dust, on a small dark ceramic plate beside a tiny espresso cup with crema and a silver spoon, three-quarter angle, patisserie styling.",

    # --- hotels (bare keys → store-hotel-*.png; real-estate framing avoids false moderation hits) ---
    "hotel-emerald": "A bright elegant hotel room interior with a tidy made king-size bed, soft warm bedside lamps, neutral tones and large windows showing a city skyline in the evening, real-estate interior photography.",
    "hotel-marina": "A spacious hotel room interior with a private balcony and large windows overlooking a calm marina at sunset, modern neutral furniture, warm lighting, real-estate interior photography.",
    "hotel-skyline": "A stylish open-plan studio loft interior with floor-to-ceiling windows, designer furniture and a daytime downtown skyline view, real-estate interior photography.",
}


def gen(key, prompt, dest):
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

    def run(label, dest, prompt):
        if os.path.exists(dest) and os.path.getsize(dest) > 1000:
            print("skip  %-26s (exists)" % label)
            return 1, 0
        t0 = time.time()
        try:
            gen(key, prompt, dest)
            print("ok    %-26s %.1fs" % (label, time.time() - t0))
            return 1, 0
        except urllib.error.HTTPError as e:
            detail = e.read().decode("utf-8", "replace")[:500]
            print("FAIL  %-26s HTTP %s: %s" % (label, e.code, detail), file=sys.stderr)
            return 0, 1
        except Exception as e:  # noqa: BLE001
            print("FAIL  %-26s %s" % (label, e), file=sys.stderr)
            return 0, 1

    print("-- categories --")
    for cat, prompt in PROMPTS.items():
        dest = os.path.join(OUT, "cat-%s.png" % cat)
        o, f = run("cat-" + cat, dest, prompt)
        ok += o; fail += f

    print("-- stores --")
    for slug, prompt in STORE_PROMPTS.items():
        dest = os.path.join(OUT, "store-%s.png" % slug)
        o, f = run("store-" + slug, dest, prompt)
        ok += o; fail += f

    print("done: %d ok, %d failed" % (ok, fail))
    sys.exit(0 if fail == 0 else 2)


if __name__ == "__main__":
    main()
