import React, { useState, useEffect, useRef } from 'react';
import { BsFillSendFill, BsTrash } from "react-icons/bs"; // Import icons
import { GoogleGenerativeAI } from "@google/generative-ai";

const Body = () => {
    const [prompt, setPrompt] = useState('');
    const [messages, setMessages] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [typingResponse, setTypingResponse] = useState('');
    const [stopTyping, setStopTyping] = useState(false);
    const typingIntervalRef = useRef(null);

    // ✅ Load API Key from .env file
    const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

    const sendMessage = async () => {
        if (prompt.trim()) {
            const newMessages = [...messages, { text: prompt, sender: 'user' }];
            setMessages(newMessages);
            setPrompt('');
            setIsLoading(true);
            setStopTyping(false);

            try {
                const result = await model.generateContent({
                    contents: [{ role: "user", parts: [{ text: prompt }] }],
                    generationConfig: { responseMimeType: "text/plain" }
                });

                const response = await result.response.text();
                const cleanResponse = response.replace(/\*\*(.*?)\*\*/g, '$1').replace(/\*(.*?)\*/g, '$1');

                let index = 0;
                typingIntervalRef.current = setInterval(() => {
                    if (index < cleanResponse.length && !stopTyping) {
                        setTypingResponse((prev) => prev + cleanResponse.charAt(index));
                        index++;
                    } else {
                        clearInterval(typingIntervalRef.current);
                        setIsLoading(false);
                        setMessages((prev) => [...prev, { text: cleanResponse, sender: 'bot' }]);
                        setTypingResponse('');
                    }
                }, 10);
            } catch (error) {
                console.error("Error generating content:", error);
                setMessages((prev) => [...prev, { text: "Error generating response", sender: 'bot' }]);
                setIsLoading(false);
            }
        }
    };

    const handleStopTyping = () => {
        setStopTyping(true);
        clearInterval(typingIntervalRef.current);
        setIsLoading(false);
    };

    const handleClearAll = () => {
        setMessages([]);
        setTypingResponse('');
        setPrompt('');
        setIsLoading(false);
        setStopTyping(false);
        clearInterval(typingIntervalRef.current);
    };

    const handleKeyDown = (e) => {
        if (e.key === 'Enter') {
            sendMessage();
        }
    };

    return (
        <div className='body'>
            <div className="conversation">
                {messages.map((msg, index) => (
                    <div key={index} className={msg.sender === 'user' ? 'user-message' : 'bot-message'}>
                        {msg.text}
                    </div>
                ))}
                {isLoading && <div className="bot-message">...</div>}
                {typingResponse && <div className="bot-message">{typingResponse}</div>}
            </div>
            <div className="input">
                <input
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                    onKeyDown={handleKeyDown}
                    type="text"
                    placeholder='Ask Anything'
                />
                <button onClick={sendMessage} className="btn send-btn"><BsFillSendFill /></button>
                {isLoading && (
                    <button onClick={handleStopTyping} className="btn stop-btn">
                        Stop
                    </button>
                )}
                <button onClick={handleClearAll} className="btn clear-btn">
                    <BsTrash />
                </button>
            </div>
        </div>
    );
};

export default Body;
