# 🌍 AI Language Practice Chatbot

An interactive web app for practicing foreign languages with an AI tutor. Type or speak in your chosen language and get instant corrections and natural conversation in return.

## ✨ Features

- **6 languages supported** — Spanish, French, Arabic, Italian, Romanian, English
- **AI-powered tutoring** — Uses large language models via [OpenRouter](https://openrouter.ai) with automatic fallback between models
- **Grammar checker** — Built-in rule-based English grammar correction (powered by [spaCy](https://spacy.io))
- **Conversation memory** — The bot remembers the last 10 exchanges to keep context
- **Voice mode** — Speak your message and hear the bot's reply using the Web Speech API (Chrome recommended)
- **Typing indicator** — Animated dots while the AI is thinking

## 🛠️ Tech Stack

| Layer    | Technology |
|----------|-----------|
| Frontend | HTML, CSS, Vanilla JavaScript |
| Backend  | Python, Flask |
| AI       | OpenRouter API (Llama 3.3 70B, Gemma 3, with fallback) |
| NLP      | spaCy (`en_core_web_sm`) |
| Voice    | Web Speech API (SpeechRecognition + SpeechSynthesis) |

## 🚀 Getting Started

### 1. Clone the repository

```bash
git clone https://github.com/your-username/ai-language-chatbot.git
cd ai-language-chatbot
```

### 2. Install Python dependencies

```bash
pip install -r requirements.txt
python -m spacy download en_core_web_sm
```

### 3. Set up your API key

Create a `.env` file in the project root (copy from the example):

```bash
cp .env.example .env
```

Then open `.env` and paste your [OpenRouter API key](https://openrouter.ai/keys).

### 4. Run the backend

```bash
python app.py
```

### 5. Open the frontend

Open `index.html` directly in your browser — or serve it with any static file server.

> The backend runs on `http://127.0.0.1:5000` by default.

## 📁 Project Structure

```
├── app.py           # Flask backend — grammar checking & AI API calls
├── index.html       # Main page
├── script.js        # Chat logic, voice mode, conversation history
├── styles.css       # Dark-theme styling
├── requirements.txt # Python dependencies
├── .env.example     # Template for environment variables
└── .gitignore
```

## 📝 Notes

- Voice mode works best in **Google Chrome** (other browsers have limited Web Speech API support).
- The free OpenRouter models may occasionally be slow or unavailable — the app handles this gracefully with a user-friendly error message.
- The English grammar checker covers basic subject-verb agreement rules. Full corrections are handled by the AI.
