from flask import Flask, request, jsonify, send_from_directory, redis
import os

app = Flask(__name__)

# Статистика переходов
visits = {
    "main": 0,
    "telegram": 0,
    "vk": 0,
    "instagram": 0,
    "whatsapp": 0
}

# Подключаемся к Redis
r = redis.Redis(host=os.getenv('REDIS_HOST'), port=os.getenv('REDIS_PORT'))

# Функция для увеличения статистики
@app.route('/increment', methods=['POST'])
def increment():
    data = request.get_json()
    name = data.get('name')

    if name:
        r.incr(name)  # Увеличиваем счётчик в Redis
        return jsonify({"message": f"Переход на {name} увеличен!", "visits": get_visits()}), 200
    else:
        return jsonify({"message": "Неизвестный эндпоинт!"}), 400

# Функция для получения статистики
def get_visits():
    visits = {key: int(r.get(key) or 0) for key in ["main", "telegram", "vk", "instagram", "whatsapp"]}
    return visits

@app.route('/statistics', methods=['GET'])
def statistics():
    return jsonify(get_visits()), 200

@app.route('/')
def index():
    return send_from_directory(os.getcwd(), 'index.html')

if __name__ == '__main__':
    port = int(os.environ.get('PORT', 5000))
    app.run(host='0.0.0.0', port=port)
