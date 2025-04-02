from flask import Flask, request, jsonify
from flask_cors import CORS
from deep_translator import GoogleTranslator as gt
import datetime
import requests
import os

app = Flask(__name__)

# Configure CORS
CORS(app, resources={
    r"/*": {
        "origins": os.getenv("FRONTEND_URL", "http://localhost:3000").split(","),
        "methods": ["GET", "POST", "OPTIONS"],
        "allow_headers": ["Content-Type"]
    }
})

# Get environment variables
HF_API_KEY = os.getenv("HF_API_KEY")

@app.route("/greet", methods=["GET"])
def greet():
    """ Return appropriate greeting based on time of day """
    hour = datetime.datetime.now().hour
    greeting = "Good morning!" if 4 <= hour < 12 else "Good afternoon!" if 12 <= hour < 17 else "Good evening!"
    return jsonify({"greeting": greeting})

@app.route("/translate", methods=["POST"])
def translate_text():
    """ Translate text API """
    try:
        data = request.get_json()
        text = data.get("text")
        dest_lang = data.get("language")

        if not text or not dest_lang:
            return jsonify({"error": "Missing text or destination language"}), 400

        translated = gt(source="auto", target=dest_lang).translate(text)
        return jsonify({"translatedText": translated})
    
    except Exception as e:
        return jsonify({"error": f"Translation failed: {str(e)}"}), 500

@app.route("/refine-transcription", methods=["POST"])
def refine_transcription():
    """ Hugging Face API to refine medical transcription """
    try:
        data = request.get_json()
        text = data.get("text")

        if not text:
            return jsonify({"error": "Missing text"}), 400

        if not HF_API_KEY:
            return jsonify({"error": "API key not configured"}), 500

        API_URL = "https://api-inference.huggingface.co/models/medicalai/ClinicalBERT"
        headers = {"Authorization": f"Bearer {HF_API_KEY}"}
        response = requests.post(API_URL, headers=headers, json={"inputs": text}, timeout=30)

        if response.status_code == 200:
            return jsonify({"refinedText": response.json()[0].get("summary_text", text)})
        else:
            return jsonify({"error": f"API Error {response.status_code}: {response.text}"}), 500
            
    except Exception as e:
        return jsonify({"error": f"Refinement failed: {str(e)}"}), 500

@app.route("/health")
def health_check():
    """ Health check endpoint """
    return jsonify({"status": "healthy"})

@app.route("/")
def home():
    return "Healthcare Translation Web App is running!"

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000)