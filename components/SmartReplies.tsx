
import React, { useState, useEffect } from 'react';
import { GoogleGenAI, Type } from "@google/genai";
import { Message } from '../types';

interface SmartRepliesProps {
  history: Message[];
  onSelectReply: (text: string) => void;
}

export const SmartReplies: React.FC<SmartRepliesProps> = ({ history, onSelectReply }) => {
  const [replies, setReplies] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchAIReplies = async () => {
    if (history.length === 0 || loading) return;
    
    // Suggest replies only if the last message was from the client
    const lastMsg = history[history.length - 1];
    if (lastMsg.sender_type !== 'client') return;

    setLoading(true);
    try {
      const apiKey = process.env.API_KEY;
      if (!apiKey) {
        console.warn("Gemini API Key not found in process.env.API_KEY");
        setReplies(["How can I help you today?", "I'll look into that for you.", "One moment please."]);
        setLoading(false);
        return;
      }

      const ai = new GoogleGenAI({ apiKey });
      const context = history.slice(-5).map(m => `${m.sender_type}: ${m.message_text}`).join('\n');
      
      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: `You are a helpful chat operator. Based on the following chat history, suggest 3 short, professional, and contextually relevant replies.
        
        Chat History:
        ${context}
        `,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              suggestions: {
                type: Type.ARRAY,
                items: { type: Type.STRING, description: "A suggested reply string." }
              }
            },
            required: ["suggestions"],
            propertyOrdering: ["suggestions"]
          }
        }
      });

      if (response.text) {
        const data = JSON.parse(response.text);
        setReplies(data.suggestions.slice(0, 3));
      }
    } catch (e) {
      console.error("Gemini Suggestion Error:", e);
      setReplies(["I'll check on that for you.", "How else can I assist?", "Thanks for reaching out!"]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAIReplies();
  }, [history]);

  return (
    <div className="space-y-3">
      {loading ? (
        <div className="space-y-3">
          {[1,2,3].map(i => (
            <div key={i} className="h-12 bg-slate-200 rounded-2xl animate-pulse"></div>
          ))}
        </div>
      ) : (
        replies.map((reply, idx) => (
          <button
            key={idx}
            onClick={() => onSelectReply(reply)}
            className="w-full text-left p-4 bg-white border border-slate-200 rounded-2xl text-[11px] font-bold text-slate-700 leading-tight hover:border-indigo-600 hover:text-indigo-600 hover:bg-indigo-50/30 transition-all group shadow-sm active:scale-95"
          >
            {reply}
          </button>
        ))
      )}
    </div>
  );
};
