# -*- coding: utf-8 -*-
"""
AA机 - 本地轻量调试服务器
使用方法: python server.py
"""
import http.server
import socketserver
import os

PORT = 8080

class AAHandler(http.server.SimpleHTTPRequestHandler):
    def end_headers(self):
        # 允许跨域与关闭缓存方便即时热改
        self.send_header('Cache-Control', 'no-cache, no-store, must-revalidate')
        super().end_headers()

if __name__ == "__main__":
    web_dir = os.path.dirname(os.path.abspath(__file__))
    os.chdir(web_dir)
    with socketserver.TCPServer(("", PORT), AAHandler) as httpd:
        print(f"[AA机] 服务已启动: http://localhost:{PORT}")
        print(f"[AA机] 手机同局域网访问: http://<你的电脑IP>:{PORT}")
        try:
            httpd.serve_forever()
        except KeyboardInterrupt:
            print("\n[AA机] 服务已停止")
