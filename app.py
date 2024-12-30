from flask import Flask, request, jsonify
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

@app.route('/')
def index():
    return send_from_directory('static', 'index.html')

# Эндпоинт для увеличения количества переходов
@app.route('/increment', methods=['POST'])
def increment():
    data = request.get_json()
    name = data.get('name')

    if name in visits:
        visits[name] += 1
        return jsonify({"message": f"Переход на {name} увеличен!", "visits": visits}), 200
    else:
        return jsonify({"message": "Неизвестный эндпоинт!"}), 400

@app.route('/reset', methods=['POST'])
def reset():
    global visits
    visits = {key: 0 for key in visits}  # Сбрасываем все счётчики
    return jsonify({"message": "Статистика сброшена!"}), 200

if __name__ == '__main__':
    port = int(os.environ.get('PORT', 5000))
    app.run(host='0.0.0.0', port=port)
