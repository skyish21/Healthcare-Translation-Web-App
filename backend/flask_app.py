from flask import Flask, request, jsonify
from flask_cors import CORS
import pyttsx3
import speech_recognition as sr
from deep_translator import GoogleTranslator as gt
import datetime
import requests
import os

app = Flask(__name__)

FRONTEND_URL = "https://your-vercel-app.vercel.app"  

# Enable CORS only for your Vercel frontend
CORS(app, resources={
    r"/*": {
        "origins": [FRONTEND_URL],
        "methods": ["GET", "POST", "OPTIONS"],
        "allow_headers": ["Content-Type"]
    }
})


FRONTEND_URL = os.getenv("FRONTEND_URL")
# Hugging Face API Key (Replace with your actual key)
HF_API_KEY = os.getenv("HF_API_KEY")


def txtsp(text, voice_choice):
    """ Convert text to speech """
    engine = pyttsx3.init()
    voices = engine.getProperty("voices")

    if voice_choice.lower() == "male":
        engine.setProperty("voice", voices[0].id)  # Male voice
    else:
        engine.setProperty("voice", voices[-1].id)  # Likely Female voice

    engine.say(text)
    engine.runAndWait()

@app.route("/greet", methods=["GET"])
def greet():
    """ Return appropriate greeting based on time of day """
    hour = datetime.datetime.now().hour
    greeting = "Good morning!" if 4 <= hour < 12 else "Good afternoon!" if 12 <= hour < 17 else "Good evening!"
    return jsonify({"greeting": greeting})

@app.route("/speech-to-text", methods=["POST"])
def speech_to_text():
    """ Capture speech and return transcribed text """
    recognizer = sr.Recognizer()
    with sr.Microphone() as source:
        recognizer.adjust_for_ambient_noise(source, duration=1)
        audio = recognizer.listen(source, timeout=5)

    try:
        text = recognizer.recognize_google(audio)
        return jsonify({"transcription": text})
    except sr.UnknownValueError:
        return jsonify({"error": "Could not understand audio"}), 400
    except sr.RequestError:
        return jsonify({"error": "Speech recognition request failed"}), 500

@app.route("/translate", methods=["POST"])
def translate_text():
    """ Translate text API """
    data = request.json
    text = data.get("text")
    dest_lang = data.get("language")

    if not text or not dest_lang:
        return jsonify({"error": "Missing text or destination language"}), 400

    try:
        translated = gt(source="auto", target=dest_lang).translate(text)
        return jsonify({"translatedText": translated})
    except Exception as e:
        return jsonify({"error": f"Translation failed: {str(e)}"}), 500

@app.route("/text-to-speech", methods=["POST"])
def generate_speech():
    """ Convert text to speech """
    data = request.json
    text = data.get("text")
    voice_choice = data.get("voice", "male")

    if not text:
        return jsonify({"error": "Missing text"}), 400

    txtsp(text, voice_choice)
    return jsonify({"status": "Speech played successfully"}), 200

@app.route("/refine-transcription", methods=["POST"])
def refine_transcription():
    """ Hugging Face API to refine medical transcription """
    data = request.json
    text = data.get("text")

    if not text:
        return jsonify({"error": "Missing text"}), 400

    API_URL = "https://api-inference.huggingface.co/models/medicalai/ClinicalBERT"
    headers = {"Authorization": f"Bearer {HF_API_KEY}"}
    response = requests.post(API_URL, headers=headers, json={"inputs": text}, timeout=60)

    if response.status_code == 200:
        response_json = response.json()
        return jsonify({"refinedText": response_json[0].get("summary_text", text)})
    else:
        return jsonify({"error": f"API Error {response.status_code}: {response.text}"}), 500
    
@app.route("/")
def home():
    return "Healthcare Translation Web App is running!"

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000)
