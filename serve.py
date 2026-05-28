#!/usr/bin/env python3
"""Tiny static dev server with caching disabled.

The default `python -m http.server` sends no Cache-Control header, so browsers
apply heuristic caching and keep serving stale .jsx/.css after edits. This
handler forces every response to be revalidated, so a normal refresh always
loads the latest files.

Usage: python serve.py [port]
"""
import os
import sys
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer

# Always serve files from this script's own directory, regardless of cwd.
os.chdir(os.path.dirname(os.path.abspath(__file__)))


class NoCacheHandler(SimpleHTTPRequestHandler):
    def end_headers(self):
        self.send_header("Cache-Control", "no-store, no-cache, must-revalidate, max-age=0")
        self.send_header("Pragma", "no-cache")
        self.send_header("Expires", "0")
        super().end_headers()

    # Quieter logs
    def log_message(self, fmt, *args):
        sys.stderr.write("%s - %s\n" % (self.address_string(), fmt % args))


if __name__ == "__main__":
    port = int(sys.argv[1]) if len(sys.argv) > 1 else 5174
    server = ThreadingHTTPServer(("127.0.0.1", port), NoCacheHandler)
    print(f"Serving (no-cache) on http://localhost:{port}")
    try:
        server.serve_forever()
    except KeyboardInterrupt:
        server.shutdown()
