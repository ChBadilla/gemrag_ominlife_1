/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/

import React, { useState, useEffect, useCallback } from 'react';
import { AppStatus, ChatMessage, ParentMessage, ChildMessage, InitChatPayload, SendMessagePayload } from './types';
import * as geminiService from './services/geminiService';
import Spinner from './components/Spinner';
import ProgressBar from './components/ProgressBar';
import ChatInterface from './components/ChatInterface';

// DO: Define the AIStudio interface to resolve a type conflict where `window.aistudio` was being redeclared with an anonymous type.
// FIX: Moved the AIStudio interface definition inside the `declare global` block to resolve a TypeScript type conflict.
declare global {
    interface AIStudio {
        openSelectKey: () => Promise<void>;
        hasSelectedApiKey: () => Promise<boolean>;
    }
    interface Window {
        aistudio?: AIStudio;
    }
}

const DEFAULT_RAG_STORE_NAME = "fileSearchStores/documentos-omnilife-sn360-iteuwvmmpaf1"; // REPLACE with your actual RAG store resource name
const DEFAULT_CHAT_DISPLAY_NAME = "Omnilife Product Assistant";

const App: React.FC = () => {
    const [status, setStatus] = useState<AppStatus>(AppStatus.Initializing);
    const [error, setError] = useState<string | null>(null);
    // Removed uploadProgress state as files are pre-uploaded to a persistent store
    const [activeRagStoreName, setActiveRagStoreName] = useState<string | null>(null);
    const [chatHistory, setChatHistory] = useState<ChatMessage[]>([]);
    const [isQueryLoading, setIsQueryLoading] = useState(false);
    const [exampleQuestions, setExampleQuestions] = useState<string[]>([]);
    const [documentName, setDocumentName] = useState<string>(''); // Now represents the chatDisplayName

    // Removed ragStoreNameRef and its useEffect as persistent stores are not deleted on unload.

    // Send messages to the parent window
    const postMessageToParent = useCallback((type: ChildMessage['type'], payload: ChildMessage['payload']) => {
        if (window.parent) {
            window.parent.postMessage({ type, payload }, '*'); // Use '*' for targetOrigin for embeddable iframes
        }
    }, []);

    const handleError = (message: string, err: any) => {
        console.error(message, err);
        const errorMessage = `${message}${err ? `: ${err instanceof Error ? err.message : String(err)}` : ''}`;
        setError(errorMessage);
        setStatus(AppStatus.Error);
        postMessageToParent('chatError', { message: errorMessage });
    };

    const clearError = () => {
        setError(null);
        // We don't return to Welcome, but to Initializing (waiting for new initChat)
        setStatus(AppStatus.Initializing);
    }

    const handleInitChat = useCallback(async (ragStoreResourceName: string, chatDisplayName: string) => {
        if (!ragStoreResourceName) {
            handleError("No RAG store resource name provided for chat initialization.", null);
            return;
        }
        
        // Always re-initialize geminiService to ensure the API key is current (though we assume process.env.API_KEY is stable)
        try {
            geminiService.initialize();
        } catch (err) {
            handleError("Initialization failed.", err);
            return;
        }
        
        setStatus(AppStatus.Initializing); // Reset status
        setError(null); // Clear previous errors

        setActiveRagStoreName(ragStoreResourceName);
        setDocumentName(chatDisplayName); // Use the provided display name

        try {
            // No file upload or store creation for persistent RAG
            // Directly generate example questions using the provided RAG store
            
            setStatus(AppStatus.Uploading); // Use Uploading status for "Generating suggestions..." for UI consistency
            // Mimic progress bar with a single step for generating suggestions
            // setUploadProgress({ current: 0, total: 1, message: "Generating suggestions..." });

            const questions = await geminiService.generateExampleQuestions(ragStoreResourceName);
            setExampleQuestions(questions);

            // setUploadProgress({ current: 1, total: 1, message: "All set!" });
            // await new Promise(resolve => setTimeout(resolve, 500)); // Short delay to show "All set!"

            setChatHistory([]);
            setStatus(AppStatus.Chatting);
            postMessageToParent('chatReady', { documentName: chatDisplayName });

        } catch (err) {
            const errorMessage = err instanceof Error ? err.message.toLowerCase() : String(err).toLowerCase();
            if (errorMessage.includes('api key not valid')) {
                handleError("The API key is invalid or not found. Please ensure a valid API Key is configured.", err);
            } else if (errorMessage.includes("requested entity was not found")) {
                 handleError(`RAG store '${ragStoreResourceName}' not found or inaccessible. Please verify the name and permissions.`, err);
            }
            else {
                handleError("Failed to initialize chat session with persistent RAG store", err);
            }
        } finally {
            // setUploadProgress(null); // No upload progress to clear
        }
    }, [postMessageToParent]); // handleInitChat now depends on postMessageToParent

    // Effect for handling postMessage events from the parent window
    useEffect(() => {
        const handleMessage = async (event: MessageEvent<ParentMessage>) => {
            // Ensure the message is from a trusted source if possible, or validate its structure
            if (event.source !== window.parent || !event.data || !event.data.type) {
                return;
            }

            const { type, payload } = event.data;

            switch (type) {
                case 'initChat':
                    const initChatPayload = payload as InitChatPayload;
                    if (status !== AppStatus.Initializing && status !== AppStatus.Error && status !== AppStatus.Chatting) {
                         // Only allow initChat if not currently uploading or already chatting
                        console.warn('Ignoring initChat: App is not in an initial or error state.');
                        return;
                    }
                    await handleInitChat(initChatPayload.ragStoreResourceName, initChatPayload.chatDisplayName);
                    break;
                case 'sendMessage':
                    const sendMessagePayload = payload as SendMessagePayload;
                    if (status === AppStatus.Chatting) {
                        await handleSendMessage(sendMessagePayload.message);
                    } else {
                        console.warn('Cannot send message: Chat is not active.');
                        postMessageToParent('chatError', { message: 'Chat is not active to send message.' });
                    }
                    break;
                case 'resetChat':
                    await handleResetChat();
                    break;
                default:
                    console.warn(`Unknown message type received: ${type}`);
                    break;
            }
        };

        window.addEventListener('message', handleMessage);

        return () => {
            window.removeEventListener('message', handleMessage);
        };
    }, [status, postMessageToParent, handleInitChat]); // Include handleInitChat in dependencies

    // New useEffect for standalone initialization
    useEffect(() => {
        // If not in an iframe (no parent window), not already initialized, and in Initializing status
        if (window.parent === window && !activeRagStoreName && status === AppStatus.Initializing) {
            console.log("App running in standalone mode, initializing with default RAG store.");
            handleInitChat(DEFAULT_RAG_STORE_NAME, DEFAULT_CHAT_DISPLAY_NAME);
        }
    }, [status, activeRagStoreName, handleInitChat]); // Dependencies to re-run when status or activeRagStoreName changes

    // Removed cleanup RAG store on component unmount or tab close, as we're using a persistent store.

    const handleResetChat = async () => {
        // No deletion of RAG store for persistent RAG
        setIsQueryLoading(true); // Indicate cleanup is happening
        try {
            setActiveRagStoreName(null);
            setChatHistory([]);
            setExampleQuestions([]);
            setDocumentName('');
            setStatus(AppStatus.Initializing); // Back to waiting for new initChat
            postMessageToParent('chatEnded', { message: 'Chat session reset.' });
        } catch (err) {
            handleError("Failed to reset chat session.", err);
        } finally {
            setIsQueryLoading(false);
        }
    };

    const handleSendMessage = async (message: string) => {
        if (!activeRagStoreName) {
            postMessageToParent('chatError', { message: 'No active chat session. Please initialize first.' });
            return;
        }

        const userMessage: ChatMessage = { role: 'user', parts: [{ text: message }] };
        setChatHistory(prev => [...prev, userMessage]);
        setIsQueryLoading(true);

        try {
            const result = await geminiService.fileSearch(activeRagStoreName, message);
            const modelMessage: ChatMessage = {
                role: 'model',
                parts: [{ text: result.text }],
                groundingChunks: result.groundingChunks
            };
            setChatHistory(prev => [...prev, modelMessage]);
            postMessageToParent('chatResponse', { text: result.text, groundingChunks: result.groundingChunks });
        } catch (err) {
            const errorMessage: ChatMessage = {
                role: 'model',
                parts: [{ text: "Sorry, I encountered an error. Please try again." }]
            };
            setChatHistory(prev => [...prev, errorMessage]);
            handleError("Failed to get response", err);
            postMessageToParent('chatError', { message: `Failed to get response: ${err instanceof Error ? err.message : String(err)}` });
        } finally {
            setIsQueryLoading(false);
        }
    };
    
    const renderContent = () => {
        switch(status) {
            case AppStatus.Initializing:
                return (
                    <div className="flex items-center justify-center h-screen">
                        <Spinner /> <span className="ml-4 text-xl">Waiting for initialization...</span>
                    </div>
                );
            case AppStatus.Uploading: // Re-purposed to show "Generating suggestions..."
                let icon = <img src="https://services.google.com/fh/files/misc/applet-suggestions_2.png" alt="Generating suggestions icon" className="h-80 w-80 rounded-lg object-cover" />;
                let message = "Generating suggestions...";
                
                // You can add more granular progress if generateExampleQuestions had intermediate steps
                // For now, it's a single blocking call, so we just show this state.
                
                return <ProgressBar 
                    progress={0} // Fixed progress for a single step
                    total={1} 
                    message={message} 
                    icon={icon}
                />;
            case AppStatus.Chatting:
                return <ChatInterface 
                    documentName={documentName}
                    history={chatHistory}
                    isQueryLoading={isQueryLoading}
                    onSendMessage={handleSendMessage}
                    onNewChat={handleResetChat} // Re-purposed to handle reset from parent for now
                    exampleQuestions={exampleQuestions}
                    hideNewChatButton={true} // Hide the button in embeddable context
                />;
            case AppStatus.Error:
                 return (
                    <div className="flex flex-col items-center justify-center h-screen bg-red-900/20 text-red-300">
                        <h1 className="text-3xl font-bold mb-4">Application Error</h1>
                        <p className="max-w-md text-center mb-4">{error}</p>
                        <button onClick={clearError} className="px-4 py-2 rounded-md bg-gem-mist hover:bg-gem-mist/70 transition-colors" title="Return to waiting for initialization">
                           Try Again / Reset
                        </button>
                    </div>
                );
            default:
                 return (
                    <div className="flex items-center justify-center h-screen">
                        <Spinner /> <span className="ml-4 text-xl">Waiting for initialization...</span>
                    </div>
                );
        }
    }

    return (
        <main className="h-screen bg-gem-onyx text-gem-offwhite">
            {renderContent()}
        </main>
    );
};

export default App;
