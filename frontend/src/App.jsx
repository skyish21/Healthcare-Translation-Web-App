import React, { useState } from "react";
import axios from "axios";

function App() {
  const [text, setText] = useState("");
  const [translatedText, setTranslatedText] = useState("");
  const [language, setLanguage] = useState("es"); // Default: Spanish
  const [transcription, setTranscription] = useState("");
  const [refinedText, setRefinedText] = useState("");

  const backendURL = process.env.REACT_APP_BACKEND_URL;

  const handleTranslate = async () => {
    try {
      const response = await axios.post(`${backendURL}/translate`, { text, language });
      setTranslatedText(response.data.translatedText);
    } catch (error) {
      console.error("Translation Error:", error);
    }
  };

  const handleSpeechToText = async () => {
    try {
      const response = await axios.post(`${backendURL}/speech-to-text`);
      setTranscription(response.data.transcription);
    } catch (error) {
      console.error("Speech-to-Text Error:", error);
    }
  };

  const handleTextToSpeech = async () => {
    try {
      await axios.post(`${backendURL}/text-to-speech`, { text, voice: "male" });
    } catch (error) {
      console.error("Text-to-Speech Error:", error);
    }
  };

  const handleRefineTranscription = async () => {
    try {
      const response = await axios.post(`${backendURL}/refine-transcription`, { text: transcription });
      setRefinedText(response.data.refinedText);
    } catch (error) {
      console.error("Refinement Error:", error);
    }
  };

  return (
    <div style={{ padding: "20px", maxWidth: "600px", margin: "auto", textAlign: "center", border: "1px solid #ccc", borderRadius: "10px", backgroundColor: "#f9f9f9" }}>
      <h1 style={{ fontSize: "24px", fontWeight: "bold" }}>Healthcare Translation App</h1>

      <textarea
        style={{ width: "100%", padding: "10px", border: "1px solid #ddd", marginBottom: "10px" }}
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="Enter text to translate..."
      />

      <div style={{ marginBottom: "10px" }}>
        <button style={{ backgroundColor: "blue", color: "white", padding: "10px", borderRadius: "5px", marginRight: "10px" }} onClick={handleTranslate}>
          Translate
        </button>
        <button style={{ backgroundColor: "green", color: "white", padding: "10px", borderRadius: "5px" }} onClick={handleTextToSpeech}>
          Speak
        </button>
      </div>

      {translatedText && (
        <div style={{ padding: "10px", border: "1px solid #ddd", backgroundColor: "#e6e6e6", marginBottom: "10px" }}>
          <h2 style={{ fontSize: "18px", fontWeight: "bold" }}>Translated Text:</h2>
          <p>{translatedText}</p>
        </div>
      )}

      <div style={{ marginBottom: "10px" }}>
        <button style={{ backgroundColor: "purple", color: "white", padding: "10px", borderRadius: "5px" }} onClick={handleSpeechToText}>
          Speech-to-Text
        </button>
      </div>

      {transcription && (
        <div style={{ padding: "10px", border: "1px solid #ddd", backgroundColor: "#e6e6e6", marginBottom: "10px" }}>
          <h2 style={{ fontSize: "18px", fontWeight: "bold" }}>Transcription:</h2>
          <p>{transcription}</p>
        </div>
      )}

      <div style={{ marginBottom: "10px" }}>
        <button style={{ backgroundColor: "indigo", color: "white", padding: "10px", borderRadius: "5px" }} onClick={handleRefineTranscription}>
          Refine Transcription
        </button>
      </div>

      {refinedText && (
        <div style={{ padding: "10px", border: "1px solid #ddd", backgroundColor: "#e6e6e6", marginBottom: "10px" }}>
          <h2 style={{ fontSize: "18px", fontWeight: "bold" }}>Refined Medical Transcription:</h2>
          <p>{refinedText}</p>
        </div>
      )}
    </div>
  );
}

export default App;
