import React, { useState, useEffect } from 'react';

function App() {
  const [inputText, setInputText] = useState('');
  const [translatedText, setTranslatedText] = useState('');
  const [refinedText, setRefinedText] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [language, setLanguage] = useState('es');
  const BACKEND_URL = process.env.REACT_APP_BACKEND_URL || 'https://your-render-backend.onrender.com';

  // Speech recognition setup
  const [recognition, setRecognition] = useState(null);

  useEffect(() => {
    if ('webkitSpeechRecognition' in window) {
      const speechRecognition = new window.webkitSpeechRecognition();
      speechRecognition.continuous = false;
      speechRecognition.interimResults = false;
      speechRecognition.lang = 'en-US';

      speechRecognition.onresult = (event) => {
        setInputText(event.results[0][0].transcript);
        setIsListening(false);
      };

      speechRecognition.onerror = () => setIsListening(false);
      setRecognition(speechRecognition);
    }
  }, []);

  const handleSpeechToText = () => {
    if (recognition) {
      setIsListening(true);
      recognition.start();
    } else {
      alert('Speech recognition not supported');
    }
  };

  const handleTranslate = async () => {
    if (!inputText.trim()) return;
    try {
      const response = await fetch(`${BACKEND_URL}/translate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: inputText, language })
      });
      const data = await response.json();
      setTranslatedText(data.translatedText || 'Translation failed');
    } catch (error) {
      setTranslatedText('Translation error');
    }
  };

  const handleRefine = async () => {
    if (!inputText.trim()) return;
    try {
      const response = await fetch(`${BACKEND_URL}/refine-transcription`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: inputText })
      });
      const data = await response.json();
      setRefinedText(data.refinedText || 'Refinement failed');
    } catch (error) {
      setRefinedText('Refinement error');
    }
  };

  const handleSpeak = () => {
    if ('speechSynthesis' in window && translatedText) {
      const utterance = new SpeechSynthesisUtterance(translatedText);
      utterance.lang = language;
      window.speechSynthesis.speak(utterance);
    }
  };

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto', padding: '20px' }}>
      <h1>Healthcare Translation App</h1>
      
      <div style={{ marginBottom: '20px' }}>
        <button 
          onClick={handleSpeechToText}
          style={{ 
            padding: '8px 16px', 
            backgroundColor: isListening ? 'red' : '#4CAF50', 
            color: 'white', 
            border: 'none',
            marginRight: '10px'
          }}
        >
          {isListening ? 'Listening...' : 'Speak'}
        </button>
        
        <textarea
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          placeholder="Speak or type your medical emergency..."
          style={{ width: '100%', height: '100px', padding: '10px', marginTop: '10px' }}
        />
      </div>

      <div style={{ marginBottom: '20px' }}>
        <select 
          value={language} 
          onChange={(e) => setLanguage(e.target.value)}
          style={{ padding: '8px', marginRight: '10px' }}
        >
          <option value="es">Spanish</option>
          <option value="fr">French</option>
          <option value="de">German</option>
        </select>

        <button 
          onClick={handleTranslate}
          style={{ padding: '8px 16px', backgroundColor: '#2196F3', color: 'white', border: 'none', marginRight: '10px' }}
        >
          Translate
        </button>
        
        <button 
          onClick={handleRefine}
          style={{ padding: '8px 16px', backgroundColor: '#FF9800', color: 'white', border: 'none' }}
        >
          Refine
        </button>
      </div>

      <div>
        <h3>Translated Text:</h3>
        <div style={{ padding: '15px', backgroundColor: '#f5f5f5', margin: '10px 0' }}>
          {translatedText || 'Translation will appear here...'}
        </div>
        <button 
          onClick={handleSpeak}
          disabled={!translatedText}
          style={{ padding: '8px 16px', backgroundColor: '#9C27B0', color: 'white', border: 'none' }}
        >
          Speak Translation
        </button>

        <h3>Refined Medical Text:</h3>
        <div style={{ padding: '15px', backgroundColor: '#f5f5f5', margin: '10px 0' }}>
          {refinedText || 'Refined text will appear here...'}
        </div>
      </div>
    </div>
  );
}

export default App;
