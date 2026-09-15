# -*- coding: utf-8 -*-
from flask import Flask, render_template
from routes.chat_routes import chat_bp
from routes.modules_routes import modules_bp

app = Flask(__name__)
app.config['SECRET_KEY'] = 'aa-phone-secret-key-2026'

# 挂载各业务板块
app.register_blueprint(chat_bp)
app.register_blueprint(modules_bp)

@app.route('/')
def index():
    return render_template('index.html')

if __name__ == '__main__':
    # 宿主运行在 0.0.0.0 便于局域网/移动端直接调试
    app.run(host='0.0.0.0', port=5000, debug=True)
