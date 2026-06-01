#!/usr/bin/env python3
"""Tiny static dev server with caching disabled + an OpenAI STT proxy.

Static files: the default `python -m http.server` sends no Cache-Control header,
so browsers keep serving stale .jsx/.css after edits. This handler forces every
response to be revalidated, so a normal refresh always loads the latest files.

Voice: POST audio to /api/transcribe and it is forwarded to OpenAI's
transcription API using the key from .env (OPENAI_API_KEY). The key lives only
here, server-side — it is never sent to the browser.

Usage: python serve.py [port]
"""
import json
import os
import sys
import urllib.error
import urllib.request
import uuid
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer

# Always serve files from this script's own directory, regardless of cwd.
HERE = os.path.dirname(os.path.abspath(__file__))
os.chdir(HERE)

OPENAI_URL = "https://api.openai.com/v1/audio/transcriptions"


def load_env():
    """Read OPENAI_* from the environment, falling back to a local .env file."""
    cfg = {}
    envpath = os.path.join(HERE, ".env")
    if os.path.exists(envpath):
        with open(envpath, encoding="utf-8") as f:
            for line in f:
                line = line.strip()
                if not line or line.startswith("#") or "=" not in line:
                    continue
                k, v = line.split("=", 1)
                cfg[k.strip()] = v.strip().strip('"').strip("'")
    key = os.environ.get("OPENAI_API_KEY") or cfg.get("OPENAI_API_KEY")
    model = os.environ.get("OPENAI_STT_MODEL") or cfg.get("OPENAI_STT_MODEL") or "whisper-1"
    return key, model


OPENAI_API_KEY, STT_MODEL = load_env()


def build_multipart(boundary, audio_bytes, filename, file_ctype, model):
    """Hand-roll multipart/form-data: a `model` text field + the audio `file`."""
    b = boundary.encode()
    crlf = b"\r\n"
    out = b""
    out += b"--" + b + crlf
    out += b'Content-Disposition: form-data; name="model"' + crlf + crlf
    out += model.encode() + crlf
    out += b"--" + b + crlf
    out += ('Content-Disposition: form-data; name="file"; filename="%s"' % filename).encode() + crlf
    out += ("Content-Type: %s" % file_ctype).encode() + crlf + crlf
    out += audio_bytes + crlf
    out += b"--" + b + b"--" + crlf
    return out


class Handler(SimpleHTTPRequestHandler):
    # Some Python builds lack a .webp mapping → it falls back to octet-stream.
    # Declare it so WebP is served as a proper image type.
    extensions_map = {**SimpleHTTPRequestHandler.extensions_map, ".webp": "image/webp"}

    # Images/fonts don't change within a session, so let the browser cache them:
    # they load once and never re-download when a screen re-mounts (this is what
    # made icons visibly reload on every tab open). Code/markup stays uncached so
    # edits always show on a normal refresh. After regenerating assets, hard-
    # refresh once (Ctrl+Shift+R) to bypass the cache.
    _CACHEABLE = (".webp", ".png", ".jpg", ".jpeg", ".gif", ".svg",
                  ".webm", ".woff", ".woff2", ".ttf", ".ico")

    def end_headers(self):
        path = self.path.split("?", 1)[0].lower()
        if path.endswith(self._CACHEABLE):
            self.send_header("Cache-Control", "public, max-age=3600")
        else:
            self.send_header("Cache-Control", "no-store, no-cache, must-revalidate, max-age=0")
            self.send_header("Pragma", "no-cache")
            self.send_header("Expires", "0")
        super().end_headers()

    def log_message(self, fmt, *args):  # quieter logs
        sys.stderr.write("%s - %s\n" % (self.address_string(), fmt % args))

    def _json(self, code, obj):
        payload = json.dumps(obj).encode("utf-8")
        self.send_response(code)
        self.send_header("Content-Type", "application/json")
        self.send_header("Content-Length", str(len(payload)))
        self.end_headers()
        self.wfile.write(payload)

    def do_POST(self):
        if self.path == "/api/transcribe":
            self.handle_transcribe()
        else:
            self._json(404, {"error": "not found"})

    def handle_transcribe(self):
        if not OPENAI_API_KEY:
            self._json(500, {"error": "OPENAI_API_KEY not set — add it to .env"})
            return
        try:
            length = int(self.headers.get("Content-Length", 0))
        except ValueError:
            length = 0
        if not length:
            self._json(400, {"error": "empty audio body"})
            return
        audio = self.rfile.read(length)
        ctype = (self.headers.get("Content-Type") or "audio/webm").split(";")[0].strip()
        ext = {
            "audio/webm": "webm", "audio/ogg": "ogg", "audio/mp4": "mp4",
            "audio/mpeg": "mp3", "audio/wav": "wav", "audio/x-wav": "wav",
        }.get(ctype, "webm")
        boundary = "----solayer" + uuid.uuid4().hex
        body = build_multipart(boundary, audio, "audio." + ext, ctype, STT_MODEL)
        req = urllib.request.Request(OPENAI_URL, data=body, method="POST")
        req.add_header("Authorization", "Bearer " + OPENAI_API_KEY)
        req.add_header("Content-Type", "multipart/form-data; boundary=" + boundary)
        try:
            with urllib.request.urlopen(req, timeout=60) as r:
                data = json.loads(r.read().decode("utf-8", "replace"))
            self._json(200, {"text": data.get("text", "")})
        except urllib.error.HTTPError as e:
            detail = e.read().decode("utf-8", "replace")
            sys.stderr.write("OpenAI error %s: %s\n" % (e.code, detail))
            self._json(e.code, {"error": "openai", "detail": detail})
        except Exception as e:  # noqa: BLE001
            sys.stderr.write("transcribe failed: %s\n" % e)
            self._json(502, {"error": str(e)})


if __name__ == "__main__":
    port = int(sys.argv[1]) if len(sys.argv) > 1 else 5174
    server = ThreadingHTTPServer(("127.0.0.1", port), Handler)
    print(f"Serving (no-cache) on http://localhost:{port}")
    print("STT model: %s | OPENAI_API_KEY: %s" % (STT_MODEL, "set" if OPENAI_API_KEY else "MISSING"))
    try:
        server.serve_forever()
    except KeyboardInterrupt:
        server.shutdown()
