/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import React, { useState, useEffect, useRef } from 'react';
import { ChatMessage } from '../types';
import Spinner from './Spinner';
import SendIcon from './icons/SendIcon';
import RefreshIcon from './icons/RefreshIcon';

interface ChatInterfaceProps {
    documentName: string;
    history: ChatMessage[];
    isQueryLoading: boolean;
    onSendMessage: (message: string) => void;
    onNewChat: () => void; // This will trigger the reset from the parent now
    exampleQuestions: string[];
    hideNewChatButton?: boolean; // New prop to control button visibility
}

const ChatInterface: React.FC<ChatInterfaceProps> = ({ documentName, history, isQueryLoading, onSendMessage, onNewChat, exampleQuestions, hideNewChatButton = false }) => {
    const [query, setQuery] = useState('');
    const [currentSuggestion, setCurrentSuggestion] = useState('');
    const [modalContent, setModalContent] = useState<string | null>(null);
    const chatEndRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (exampleQuestions.length === 0) {
            setCurrentSuggestion('');
            return;
        }

        setCurrentSuggestion(exampleQuestions[0]);
        let suggestionIndex = 0;
        const intervalId = setInterval(() => {
            suggestionIndex = (suggestionIndex + 1) % exampleQuestions.length;
            setCurrentSuggestion(exampleQuestions[suggestionIndex]);
        }, 5000);

        return () => clearInterval(intervalId);
    }, [exampleQuestions]);
    
    const renderMarkdown = (text: string) => {
        if (!text) return { __html: '' };

        const lines = text.split('\n');
        let html = '';
        let listType: 'ul' | 'ol' | null = null;
        let paraBuffer = '';

        function flushPara() {
            if (paraBuffer) {
                html += `<p class="my-2">${paraBuffer}</p>`;
                paraBuffer = '';
            }
        }

        function flushList() {
            if (listType) {
                html += `</${listType}>`;
                listType = null;
            }
        }

        for (const rawLine of lines) {
            const line = rawLine
                .replace(/\*\*(.*?)\*\*|__(.*?)__/g, '<strong>$1$2</strong>')
                .replace(/\*(.*?)\*|_(.*?)_/g, '<em>$1$2</em>')
                .replace(/`([^`]+)`/g, '<code class="bg-brand-soft/30 px-1 py-0.5 rounded-sm font-mono text-sm">$1</code>');

            const isOl = line.match(/^\s*\d+\.\s(.*)/);
            const isUl = line.match(/^\s*[\*\-]\s(.*)/);

            if (isOl) {
                flushPara();
                if (listType !== 'ol') {
                    flushList();
                    html += '<ol class="list-decimal list-inside my-2 pl-5 space-y-1">';
                    listType = 'ol';
                }
                html += `<li>${isOl[1]}</li>`;
            } else if (isUl) {
                flushPara();
                if (listType !== 'ul') {
                    flushList();
                    html += '<ul class="list-disc list-inside my-2 pl-5 space-y-1">';
                    listType = 'ul';
                }
                html += `<li>${isUl[1]}</li>`;
            } else {
                flushList();
                if (line.trim() === '') {
                    flushPara();
                } else {
                    paraBuffer += (paraBuffer ? '<br/>' : '') + line;
                }
            }
        }

        flushPara();
        flushList();

        return { __html: html };
    };


    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (query.trim()) {
            onSendMessage(query);
            setQuery('');
        }
    };

    const handleSourceClick = (text: string) => {
        setModalContent(text);
    };

    const closeModal = () => {
        setModalContent(null);
    };

    useEffect(() => {
        chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [history, isQueryLoading]);

    return (
        <div className="flex flex-col h-full relative">
            <header className="absolute top-0 left-0 right-0 p-4 bg-surface-base/90 backdrop-blur-sm z-10 flex justify-between items-center border-b border-brand-soft/30 shadow-sm">
                <div className="w-full max-w-4xl mx-auto flex justify-between items-center px-4">
                    <h1 className="text-2xl font-heading font-bold text-text-base truncate" title="Bienvenido a su Asistente IA">Bienvenido a su Asistente IA</h1>
                    {!hideNewChatButton && (
                        <button
                            onClick={onNewChat}
                            className="flex items-center px-4 py-2 bg-brand hover:bg-brand-hover rounded-full text-white transition-colors flex-shrink-0"
                            title="Terminar chat actual e iniciar uno nuevo"
                        >
                            <RefreshIcon />
                            <span className="ml-2 hidden sm:inline">Nuevo Chat</span>
                        </button>
                    )}
                </div>
            </header>

            <div className="flex-grow pt-24 pb-32 overflow-y-auto px-4 bg-surface-muted">
                <div className="w-full max-w-4xl mx-auto space-y-6">
                    {history.map((message, index) => (
                        <div key={index} className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                            <div className={`max-w-xl lg:max-w-2xl px-5 py-3 rounded-2xl shadow-sm ${
                                message.role === 'user' 
                                ? 'bg-brand text-white' 
                                : 'bg-surface-base text-text-base'
                            }`}>
                                <div dangerouslySetInnerHTML={renderMarkdown(message.parts[0].text)} />
                                {message.role === 'model' && message.groundingChunks && message.groundingChunks.length > 0 && (
                                    <div className="mt-4 pt-3 border-t border-brand-soft/30">
                                        <h4 className="text-xs font-semibold text-text-muted mb-2 text-right">Fuentes:</h4>
                                        <div className="flex flex-wrap gap-2 justify-end">
                                            {message.groundingChunks.map((chunk, chunkIndex) => (
                                                chunk.retrievedContext?.text && (
                                                    <button
                                                        key={chunkIndex}
                                                        onClick={() => handleSourceClick(chunk.retrievedContext!.text!)}
                                                        className="bg-brand-soft/40 hover:bg-brand-soft text-text-base text-xs px-3 py-1 rounded-md transition-colors"
                                                        aria-label={`Ver fuente ${chunkIndex + 1}`}
                                                        title="Ver fragmento del documento fuente"
                                                    >
                                                        Fuente {chunkIndex + 1}
                                                    </button>
                                                )
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    ))}
                    {isQueryLoading && (
                        <div className="flex justify-start">
                            <div className="max-w-xl lg:max-w-2xl px-5 py-3 rounded-2xl bg-surface-base shadow-sm flex items-center">
                                <Spinner />
                            </div>
                        </div>
                    )}
                    <div ref={chatEndRef} />
                </div>
            </div>

            <div className="absolute bottom-0 left-0 right-0 p-4 bg-surface-base/90 backdrop-blur-sm shadow-lg">
                 <div className="max-w-4xl mx-auto">
                    <div className="text-center mb-2 min-h-[3rem] flex items-center justify-center">
                        {!isQueryLoading && currentSuggestion && (
                            <button
                                onClick={() => setQuery(currentSuggestion)}
                                className="text-base text-text-base bg-brand-soft/30 hover:bg-brand-soft/50 transition-colors px-4 py-2 rounded-full border border-brand-soft"
                                title="Usar esta sugerencia como tu pregunta"
                            >
                                Prueba: "{currentSuggestion}"
                            </button>
                        )}
                    </div>
                     <form onSubmit={handleSubmit} className="flex items-center space-x-3">
                        <input
                            type="text"
                            value={query}
                            onChange={(e) => setQuery(e.target.value)}
                            placeholder="IA Asistente, le ayudo a utilizar esta App..."
                            className="flex-grow bg-surface-muted border border-brand-soft/50 rounded-full py-3 px-5 text-text-base focus:outline-none focus:ring-2 focus:ring-brand"
                            disabled={isQueryLoading}
                        />
                        <button type="submit" disabled={isQueryLoading || !query.trim()} className="p-3 bg-brand hover:bg-brand-hover rounded-full text-white disabled:bg-brand-soft/50 transition-colors" title="Enviar mensaje">
                            <SendIcon />
                        </button>
                    </form>
                </div>
            </div>

            {modalContent !== null && (
                <div 
                    className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4" 
                    onClick={closeModal} 
                    role="dialog" 
                    aria-modal="true"
                    aria-labelledby="source-modal-title"
                >
                    <div className="bg-surface-base p-6 rounded-xl shadow-lg w-full max-w-2xl max-h-[80vh] flex flex-col" onClick={e => e.stopPropagation()}>
                        <h3 id="source-modal-title" className="text-xl font-heading font-bold mb-4 text-text-base">Texto Fuente</h3>
                        <div 
                            className="flex-grow overflow-y-auto pr-4 text-text-base border-t border-b border-brand-soft/30 py-4"
                            dangerouslySetInnerHTML={renderMarkdown(modalContent || '')}
                        >
                        </div>
                        <div className="flex justify-end mt-6">
                            <button onClick={closeModal} className="btn-primary" title="Cerrar vista de fuente">
                                Cerrar
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ChatInterface;
