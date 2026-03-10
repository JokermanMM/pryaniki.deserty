import os
import redis
from datetime import datetime
from flask import Flask, request, jsonify, send_from_directory, render_template, abort

app = Flask(__name__, static_folder='static', template_folder='templates')

# Redis connection
redis_url = os.getenv("REDIS_URL", "redis://red-cv7bmh23esus73ed5tpg:6379")
r = redis.Redis.from_url(redis_url, decode_responses=True)

# Admin secret key
ADMIN_KEY = os.getenv("ADMIN_KEY", "admin123")


@app.route('/')
def index():
    return send_from_directory(os.getcwd(), 'index.html')


@app.route('/admin')
def admin():
    key = request.args.get('key', '')
    if key != ADMIN_KEY:
        abort(403)
    return render_template('admin.html')


# Increment click counter (stores both total and monthly)
@app.route('/increment', methods=['POST'])
def increment():
    data = request.get_json()
    name = data.get('name')

    if name:
        month = datetime.utcnow().strftime('%Y-%m')

        # Total counters (backward compatible)
        r.incr(name)
        r.incr("main")

        # Monthly counters
        r.incr(f"{name}:{month}")
        r.incr(f"main:{month}")

        return jsonify({"message": f"Переход на {name} увеличен!"}), 200
    else:
        return jsonify({"message": "Неизвестный эндпоинт!"}), 400


# Get statistics with optional month filter
@app.route('/statistics', methods=['GET'])
def statistics():
    month = request.args.get('month')  # e.g. "2026-03" or None for all-time

    if month:
        # Return monthly stats: keys matching "*:{month}"
        pattern = f"*:{month}"
        keys = r.keys(pattern)
        result = {}
        for key in keys:
            base_name = key.rsplit(':', 1)[0]  # "telegram:2026-03" -> "telegram"
            result[base_name] = int(r.get(key) or 0)
        return jsonify(result), 200
    else:
        # All-time: return only keys without ":" (backward compatible)
        return jsonify(get_visits()), 200


# Get available months
@app.route('/months', methods=['GET'])
def get_months():
    keys = r.keys('main:*')
    months = sorted(set(k.split(':')[-1] for k in keys), reverse=True)
    return jsonify(months), 200


# Reset statistics (protected)
@app.route('/reset', methods=['POST'])
def reset():
    key = request.args.get('key', '')
    if key != ADMIN_KEY:
        abort(403)
    r.flushdb()
    return jsonify({"message": "Статистика сброшена!"}), 200


# Helper: get all simple (non-monthly) values from Redis
def get_visits():
    keys = [k for k in r.keys() if ':' not in k]
    return {key: int(r.get(key) or 0) for key in keys}


if __name__ == '__main__':
    port = int(os.environ.get('PORT', 5000))
    app.run(host='0.0.0.0', port=port)
