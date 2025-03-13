import React, { useState, useEffect, useRef } from 'react';
import { BsFillSendFill, BsTrash } from "react-icons/bs"; // Import trash icon
import { GoogleGenerativeAI } from "@google/generative-ai";

const Body = () => {
    const [prompt, setPrompt] = useState('');
    const [messages, setMessages] = useState([]);
    const [isLoading, setIsLoading] = useState(false); // Loading state
    const [typingResponse, setTypingResponse] = useState(''); // For typing effect
    const [stopTyping, setStopTyping] = useState(false); // Stop typing state
    const typingIntervalRef = useRef(null); // Ref to store the interval ID

    const genAI = new GoogleGenerativeAI("AIzaSyAdtsEDWlJmMYPYL_kKaHKEwQBdoZEeRfg");
    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

    const sendMessage = async () => {
        if (prompt.trim()) {
            const newMessages = [...messages, { text: prompt, sender: 'user' }];
            setMessages(newMessages);
            setPrompt('');
            setIsLoading(true); // Start loading
            setStopTyping(false); // Reset stop typing state

            try {
                const result = await model.generateContent(prompt);
                const response = await result.response.text();

                // Simulate typing effect
                let index = 0;
                typingIntervalRef.current = setInterval(() => {
                    if (index < response.length && !stopTyping) {
                        setTypingResponse((prev) => prev + response.charAt(index));
                        index++;
                    } else {
                        clearInterval(typingIntervalRef.current); // Clear interval
                        setIsLoading(false); // Stop loading
                        setMessages((prev) => [...prev, { text: response, sender: 'bot' }]);
                        setTypingResponse(''); // Reset typing response
                    }
                }, 10); // Adjust typing speed (milliseconds)
            } catch (error) {
                console.error("Error generating content:", error);
                setMessages((prev) => [...prev, { text: "Error generating response", sender: 'bot' }]);
                setIsLoading(false); // Stop loading
            }
        }
    };

    const handleStopTyping = () => {
        setStopTyping(true); // Stop the typing effect
        clearInterval(typingIntervalRef.current); // Clear the interval
        setIsLoading(false); // Stop loading
    };

    const handleClearAll = () => {
        setMessages([]); // Clear all messages
        setTypingResponse(''); // Clear typing response
        setPrompt(''); // Clear input
        setIsLoading(false); // Stop loading
        setStopTyping(false); // Reset stop typing state
        clearInterval(typingIntervalRef.current); // Clear any active interval
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
                {isLoading && (
                    <div className="bot-message">...</div> // Show "..." while loading
                )}
                {typingResponse && (
                    <div className="bot-messagee">{typingResponse}</div> // Show typing response
                )}
            </div>
            <div className="input">
                <input 
                    value={prompt} 
                    onChange={(e) => setPrompt(e.target.value)} 
                    onKeyDown={handleKeyDown} 
                    type="text" 
                    placeholder='Ask Anything' 
                />
                <button onClick={sendMessage}><BsFillSendFill /></button>
                {isLoading && ( // Show stop button only when loading
                    <button onClick={handleStopTyping} style={{ marginLeft: '10px' }}>
                        Stop
                    </button>
                )}
                <button onClick={handleClearAll} style={{ marginLeft: '10px' }}>
                    <BsTrash /> {/* Trash icon for clear all */}
                </button>
            </div>
        </div>
    );
};

export default Body;