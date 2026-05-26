from flask import Flask, request, jsonify, send_from_directory
from flask_cors import CORS
import os
import spacy
import requests
from dotenv import load_dotenv

load_dotenv()

# Flask setup
app = Flask(__name__, static_folder=".", static_url_path="")
CORS(app)


# Serve the frontend
@app.route("/")
def index():
    return send_from_directory(".", "index.html")

# Load spaCy
nlp = spacy.load("en_core_web_sm")


# Simple grammar rules (fast fixes)
def check_grammar(text):
    doc = nlp(text)

    for i in range(len(doc) - 1):
        subject = doc[i]
        verb = doc[i + 1]

        sub = subject.text.lower()
        vb = verb.text.lower()

        if sub == "i" and vb in ["is", "are"]:
            return {
                "corrected": text.replace(verb.text, "am", 1),
                "explanation": "Use 'am' with 'I'."
            }

        if sub in ["he", "she", "it"] and vb in ["am", "are"]:
            return {
                "corrected": text.replace(verb.text, "is", 1),
                "explanation": "Use 'is' with he/she/it."
            }

        if sub in ["they", "we", "you"] and vb in ["is", "am"]:
            return {
                "corrected": text.replace(verb.text, "are", 1),
                "explanation": "Use 'are' with they/we/you."
            }

    return None


# AI function with fallback models and error handling
def check_with_gemini(text, lang, history=None):
    system_prompt = f"""You are a language tutor. Language: {lang}
RULES — follow these exactly, no exceptions:
- Reply with ONE sentence maximum, never more
- If input is WRONG: "Correction: [fixed]. [one word reason]"
- If input is CORRECT: one natural conversational reply only
- NEVER give multiple examples
- NEVER explain further
- NEVER list alternatives"""

    if history is None:
        history = []

    messages = [{"role": "system", "content": system_prompt}]
    messages += history
    messages.append({"role": "user", "content": text})

    try:
        response = requests.post(
            "https://openrouter.ai/api/v1/chat/completions",
            headers={
                "Authorization": f"Bearer {os.getenv('OPENROUTER_API_KEY')}",
                "Content-Type": "application/json"
            },
            json={
                "models": [
                    "meta-llama/llama-3.3-70b-instruct:free",
                    "google/gemma-3-4b-it:free",
                    "openrouter/auto"
                ],
                "route": "fallback",
                "messages": messages
            }
        )
        data = response.json()

        # Handle API-level errors gracefully
        if "error" in data:
            print("API error:", data["error"])
            return {
                "corrected": "AI tutor unavailable. Try again in a moment.",
                "explanation": ""
            }

        reply = data["choices"][0]["message"]["content"].strip()
        return {"corrected": reply, "explanation": ""}

    except Exception as e:
        print("AI error:", e)
        return {
            "corrected": "⚠️ AI tutor unavailable. Try again in a moment.",
            "explanation": ""
        }


# Main route
@app.route("/check", methods=["POST"])
def check():
    data = request.get_json()
    text = data.get("text", "").strip()
    lang = data.get("language", "english").capitalize()
    history = data.get("history", [])

    if not text:
        return jsonify({"corrected": "Please enter a message.", "explanation": ""}), 400

    if lang == "English":
        result = check_grammar(text)
        if result:
            return jsonify(result)

    result = check_with_gemini(text, lang, history)
    return jsonify(result)


# Run server
if __name__ == "__main__":
    debug = os.getenv("FLASK_DEBUG", "false").lower() == "true"
    app.run(debug=debug)