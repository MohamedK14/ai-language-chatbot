const chatbox = document.getElementById("chatbox");
const input = document.getElementById("userInput");
const sendBtn = document.getElementById("sendBtn");
const welcomeMsg = document.getElementById("welcomeMsg")
const language = document.getElementById("language")

let conversationHistory = [];


const messages = {
    spanish: "¡Bienvenido! Empieza a practicar 😊",
    french: "Bienvenue ! Commence à pratiquer 😊",
    arabic: "مرحبًا! ابدأ التدريب 😊",
    italian: "Benvenuto! Inizia a praticare 😊",
    english: "Welcome! Start practicing 😊",
    romanian: "Bine ai venit! Începe să exersezi 😊"
};




function updateWelcome() {
    const lang = language.value;
    welcomeMsg.textContent = messages[lang] || "";
}

language.addEventListener("change", updateWelcome)
updateWelcome()




// Send message when button is clicked
sendBtn.addEventListener("click", sendMessage);

// Also send when pressing Enter
input.addEventListener("keydown", function (e) {

    // Shift + Enter → allow new line
    if (e.key === "Enter" && e.shiftKey) {
        return; // let browser create newline
    }

    // Enter alone → send message
    if (e.key === "Enter") {
        e.preventDefault(); // stop newline
        sendMessage();
    }

});

function showTyping() {
    const div = document.createElement("div");
    div.classList.add("message", "bot", "typing");
    div.id = "typingIndicator";
    div.innerHTML = "<span></span><span></span><span></span>";
    chatbox.appendChild(div);
    chatbox.scrollTop = chatbox.scrollHeight;
}

function hideTyping() {
    const indicator = document.getElementById("typingIndicator");
    if (indicator) indicator.remove();
}

async function sendMessage(fromVoice = false) {
    const message = input.value.trim();
    if (message === "") return;

    const lang = language.value;
    if (lang === "options") {
        addMessage("Please select a language first.", "bot");
        return;
    }

    addMessage(message, "user");
    input.value = "";
    showTyping();
    sendBtn.disabled = true;

    try {
        const response = await fetch("http://127.0.0.1:5000/check", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ text: message, language: lang, history: conversationHistory })
        });

        const data = await response.json();
        hideTyping();
        addMessage(data.corrected, "bot");
        if (data.explanation) addMessage(data.explanation, "bot");
        // speak the response if voice mode is on
        if (fromVoice || voiceMode) {
            speak(data.corrected, language.value);
        }
        // save to history
        conversationHistory.push({ role: "user", content: message });
        conversationHistory.push({ role: "assistant", content: data.corrected });
        // keep history from growing too long (last 10 exchanges)
        if (conversationHistory.length > 20) {
            conversationHistory = conversationHistory.slice(-20);
        }

    } catch (error) {
        hideTyping();
        addMessage("Error connecting to server.", "bot");
        console.error(error);
    } finally {
        sendBtn.disabled = false;
    }
}

function addMessage(text, sender) {
    const messageDiv = document.createElement("div");
    messageDiv.classList.add("message", sender);
    messageDiv.textContent = text;

    chatbox.appendChild(messageDiv);

    // Auto-scroll to bottom
    chatbox.scrollTop = chatbox.scrollHeight;
}



// ── VOICE MODE ──────────────────────────────────────────
const voiceBtn = document.getElementById("voiceBtn");
let voiceMode = false;
let recognition = null;
let isSpeaking = false;

// Check browser support
const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;

if (!SpeechRecognition) {
    voiceBtn.disabled = true;
    voiceBtn.title = "Voice not supported in this browser (use Chrome)";
}

function getVoiceLang(lang) {
    const map = {
        english: "en-US",
        spanish: "es-ES",
        french: "fr-FR",
        italian: "it-IT",
        arabic: "ar-SA",
        romanian: "ro-RO"
    };
    return map[lang] || "en-US";
}

function speak(text, lang) {
    window.speechSynthesis.cancel(); // stop any current speech
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = getVoiceLang(lang);
    utterance.rate = 0.95;
    isSpeaking = true;
    utterance.onend = () => {
        isSpeaking = false;
        // auto-restart listening after bot finishes speaking
        if (voiceMode && recognition) {
            recognition.start();
        }
    };
    window.speechSynthesis.speak(utterance);
}

function startRecognition() {
    recognition = new SpeechRecognition();
    recognition.lang = getVoiceLang(language.value);
    recognition.continuous = false;      // one phrase at a time
    recognition.interimResults = false;

    recognition.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        input.value = transcript;
        sendMessage(true); // true = voice mode, will trigger speak()
    };

    recognition.onerror = (e) => {
        console.error("Voice error:", e.error);
        // ignore no-speech (just means silence), restart only on real errors
        if (voiceMode && e.error !== "aborted" && e.error !== "no-speech") {
            setTimeout(() => {
                try { recognition.start(); } catch (err) { console.log("Restart skipped:", err); }
            }, 1000);
        }
    };

    recognition.onend = () => {
        // restart listening if not speaking and voice mode still on
        if (voiceMode && !isSpeaking) {
            setTimeout(() => recognition.start(), 500);
        }
    };

    recognition.start();
}

function toggleVoiceMode() {
    voiceMode = !voiceMode;
    voiceBtn.classList.toggle("active", voiceMode);
    voiceBtn.textContent = voiceMode ? "🔴" : "🎤";

    if (voiceMode) {
        startRecognition();
        addMessage("🎤 Voice mode ON — start speaking!", "bot");
    } else {
        if (recognition) recognition.abort();
        window.speechSynthesis.cancel();
        addMessage("Voice mode OFF.", "bot");
    }
}

voiceBtn.addEventListener("click", toggleVoiceMode);