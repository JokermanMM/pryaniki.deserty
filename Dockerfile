# Используем официальный образ Python
FROM python:3.9-slim

# Устанавливаем рабочую директорию
WORKDIR /app

# Копируем файлы в контейнер
COPY . .

# Устанавливаем зависимости
RUN pip install -r requirements.txt

# Открываем порт для Flask-приложения
EXPOSE 5000

# Указываем команду для запуска приложения
CMD ["python", "app.py"]
