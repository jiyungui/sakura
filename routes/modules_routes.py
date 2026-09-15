# -*- coding: utf-8 -*-
from flask import Blueprint, jsonify

modules_bp = Blueprint('modules', __name__, url_prefix='/api/modules')

# 注册9个板块的基础配置
MODULES_CONFIG = [
    {"id": "chat", "name": "对话", "code": "CHAT", "icon": "chat"},
    {"id": "moments", "name": "动态", "code": "MOMENTS", "icon": "feed"},
    {"id": "characters", "name": "角色库", "code": "CHARS", "icon": "users"},
    {"id": "masks", "name": "面具库", "code": "MASKS", "icon": "mask"},
    {"id": "aesthetic", "name": "美化", "code": "AESTHETIC", "icon": "palette"},
    {"id": "wallet", "name": "钱包", "code": "WALLET", "icon": "card"},
    {"id": "favorites", "name": "收藏", "code": "FAVORITES", "icon": "bookmark"},
    {"id": "shop", "name": "购物", "code": "SHOP", "icon": "bag"},
    {"id": "settings", "name": "设置", "code": "SETTINGS", "icon": "sliders"}
]

@modules_bp.route('/config', methods=['GET'])
def get_modules():
    return jsonify({"code": 0, "data": MODULES_CONFIG})
