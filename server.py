#!/usr/bin/env python3
"""
server.py — SPA-aware static file server for Naturally Elevated Co.
Serves index.html for any URL that isn't a real file on disk.
Usage: python server.py [port]
"""
import sys
import os
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer

PORT = int(sys.argv[1]) if len(sys.argv) > 1 else 47291

STATIC_EXTENSIONS = {
    '.css', '.js', '.jpg', '.jpeg', '.png', '.svg',
    '.ico', '.gif', '.webp', '.woff', '.woff2',
    '.xml', '.txt', '.json', '.map'
}

class SPAHandler(SimpleHTTPRequestHandler):
    def do_GET(self):
        # Strip query string for file-existence check
        path = self.path.split('?')[0].split('#')[0]
        # Build the filesystem path
        fs_path = os.path.join(os.getcwd(), path.lstrip('/'))
        _, ext = os.path.splitext(path)

        if ext.lower() in STATIC_EXTENSIONS and os.path.isfile(fs_path):
            # Serve real static files normally
            super().do_GET()
        elif os.path.isfile(fs_path) and not ext:
            # Exact file match with no extension — serve normally
            super().do_GET()
        else:
            # SPA fallback: serve index.html for all routes
            self.path = '/index.html'
            super().do_GET()

    def log_message(self, format, *args):
        print(f'  {self.address_string()} -> {args[0][:60]}')

if __name__ == '__main__':
    os.chdir(os.path.dirname(os.path.abspath(__file__)))
    server = ThreadingHTTPServer(('', PORT), SPAHandler)
    print(f'\n  Naturally Elevated Co. dev server')
    print(f'  http://localhost:{PORT}\n')
    try:
        server.serve_forever()
    except KeyboardInterrupt:
        print('\n  Server stopped.')
