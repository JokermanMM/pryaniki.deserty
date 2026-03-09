import os
import redis
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


# Increment click counter
@app.route('/increment', methods=['POST'])
def increment():
    data = request.get_json()
    name = data.get('name')

    if name:
        r.incr(name)
        r.incr("main")
        return jsonify({"message": f"Переход на {name} увеличен!", "visits": get_visits()}), 200
    else:
        return jsonify({"message": "Неизвестный эндпоинт!"}), 400


# Get statistics
@app.route('/statistics', methods=['GET'])
def statistics():
    return jsonify(get_visits()), 200


# Reset statistics (protected)
@app.route('/reset', methods=['POST'])
def reset():
    key = request.args.get('key', '')
    if key != ADMIN_KEY:
        abort(403)
    r.flushdb()
    return jsonify({"message": "Статистика сброшена!"}), 200


# Helper: get all Redis values
def get_visits():
    keys = r.keys()
    return {key: int(r.get(key) or 0) for key in keys}


if __name__ == '__main__':
    port = int(os.environ.get('PORT', 5000))
    app.run(host='0.0.0.0', port=port)
