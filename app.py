import os
import redis
from flask import Flask, request, jsonify, send_from_directory

app = Flask(__name__)

# Подключение к Redis через полный URL
redis_url = os.getenv("REDIS_URL", "redis://localhost:6379")
r = redis.Redis.from_url(redis_url, decode_responses=True)

@app.route('/')
def index():
    return send_from_directory(os.getcwd(), 'index.html')

# Эндпоинт для увеличения статистики
@app.route('/increment', methods=['POST'])
def increment():
    data = request.get_json()
    name = data.get('name')

    if name:
        r.incr(name)  # Увеличиваем счётчик в Redis
        return jsonify({"message": f"Переход на {name} увеличен!", "visits": get_visits()}), 200
    else:
        return jsonify({"message": "Неизвестный эндпоинт!"}), 400

# Получение статистики
@app.route('/statistics', methods=['GET'])
def statistics():
    return jsonify(get_visits()), 200

# Сброс статистики
@app.route('/reset', methods=['POST'])
def reset():
    r.flushdb()  # Полный сброс базы Redisa
    return jsonify({"message": "Статистика сброшена!"}), 200

# Функция для получения всех значений из Redis
def get_visits():
    keys = r.keys()  # Получаем все ключи из Redis
    return {key: int(r.get(key) or 0) for key in keys}

if name == '__main__':
    port = int(os.environ.get('PORT', 5000))
    app.run(host='0.0.0.0', port=port)
