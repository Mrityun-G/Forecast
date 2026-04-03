from flask import Flask, jsonify, request, send_from_directory
import pandas as pd
import os
import requests

app = Flask(__name__)

# 🔑 ADD YOUR KEYS HERE
WAQI_KEY = "8ca016d57877de6c7950b68762a4729bb941cdf5"
WEATHER_KEY = "e29a04212ae44a3ce3c44f5d66f52524"
AI_KEY = "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"

# ---------------- HOME ----------------
@app.route("/")
def home():
    return send_from_directory(os.getcwd(), "index.html")

@app.route("/style.css")
def style():
    return send_from_directory(os.getcwd(), "style.css")

@app.route("/script.js")
def script():
    return send_from_directory(os.getcwd(), "script.js")

# ---------------- LIVE DATA ----------------
@app.route("/live-data")
def live_data():
    city = request.args.get("city").lower()

    waqi_url = f"https://api.waqi.info/feed/{city}/?token={WAQI_KEY}"
    weather_url = f"https://api.openweathermap.org/data/2.5/weather?q={city}&appid={WEATHER_KEY}&units=metric"

    waqi = requests.get(waqi_url).json()
    weather = requests.get(weather_url).json()

    no2 = waqi.get("data", {}).get("iaqi", {}).get("no2", {}).get("v", 0)
    o3 = waqi.get("data", {}).get("iaqi", {}).get("o3", {}).get("v", 0)

    temp = weather.get("main", {}).get("temp", 0)
    wind = weather.get("wind", {}).get("speed", 0)

    return jsonify({
        "aqi": waqi.get("data", {}).get("aqi", 0),
        "no2": no2,
        "o3": o3,
        "temp": temp,
        "wind": wind
    })

# ---------------- AI INSIGHT ----------------
@app.route("/ai-insight")
def ai_insight():
    c1 = request.args.get("c1")
    c2 = request.args.get("c2")

    prompt = f"""
    Compare pollution between {c1} and {c2}.
    Give short health advice.
    """

    response = requests.post(
        "https://openrouter.ai/api/v1/chat/completions",
        headers={
            "Authorization": f"Bearer {AI_KEY}",
            "Content-Type": "application/json"
        },
        json={
            "model": "openai/gpt-3.5-turbo",
            "messages": [{"role": "user", "content": prompt}]
        }
    )

    result = response.json()
    return jsonify({"insight": result["choices"][0]["message"]["content"]})

# ---------------- RUN ----------------
if __name__ == "__main__":
    app.run(debug=True)