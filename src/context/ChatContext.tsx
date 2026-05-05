/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { Conversation, Message, MessagePayload, UserPublicInfo } from '@/app/types';
import * as api from '@/lib/api';
import * as crypto from '@/lib/crypto';
import { useAuth } from './AuthContext';

interface DecryptedMessage extends Message {
    text: string;
    isDecrypting?: boolean;
    decryptionError?: boolean;
}

interface ChatContextType {
    conversations: Conversation[];
    activeConversation: Conversation | null;
    messages: DecryptedMessage[];
    isLoadingConversations: boolean;
    isLoadingMessages: boolean;
    setActiveConversation: (conversation: Conversation | null) => void;
    sendMessage: (text: string) => Promise<void>;
    searchUsers: (q: string) => Promise<UserPublicInfo[]>;
    startNewConversation: (user: UserPublicInfo) => void;
}

const ChatContext = createContext<ChatContextType | undefined>(undefined);

export const ChatProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const { user, privateKey, isAuthenticated } = useAuth();
    const [conversations, setConversations] = useState<Conversation[]>([]);
    const [activeConversation, setActiveConversation] = useState<Conversation | null>(null);
    const [messages, setMessages] = useState<DecryptedMessage[]>([]);
    const [isLoadingConversations, setIsLoadingConversations] = useState(false);
    const [isLoadingMessages, setIsLoadingMessages] = useState(false);
    const ws = useRef<WebSocket | null>(null);

    const decryptSingleMessage = useCallback(async (message: Message): Promise<DecryptedMessage> => {
        if (!privateKey) return { ...message, text: "[Encrypted]", decryptionError: true };
        
        try {
            // Determine which key to use:
            // If we sent it, use encrypted_key_for_self
            // If we received it, use encrypted_key
            const isSentByMe = message.from_user_id === user?.id;
            
            // Defensive property access for both snake_case and camelCase
            const payload = message.payload as any;
            const keyToUse = isSentByMe 
                ? (payload.encrypted_key_for_self || payload.encryptedKeyForSelf)
                : (payload.encrypted_key || payload.encryptedKey);
            
            const ciphertext = payload.ciphertext || payload.encryptedContent;
            const iv = payload.iv;

            if (!keyToUse || !ciphertext || !iv) {
                console.error("Message payload is missing required decryption keys or content", { id: message.id, payload });
                return { ...message, text: "[Incomplete Payload]", decryptionError: true };
            }
            
            const text = await crypto.decryptMessage(
                ciphertext,
                keyToUse,
                iv,
                privateKey
            );
            return { ...message, text };
        } catch (err) {
            console.error("Decryption failed for message", message.id, err);
            return { ...message, text: "[Decryption Failed]", decryptionError: true };
        }
    }, [privateKey, user]);

    const fetchConversations = useCallback(async () => {
        if (!isAuthenticated) return;
        setIsLoadingConversations(true);
        try {
            const data = await api.getConversations();
            setConversations(data);
        } catch (err) {
            console.error("Failed to fetch conversations", err);
        } finally {
            setIsLoadingConversations(false);
        }
    }, [isAuthenticated]);

    const fetchMessages = useCallback(async (userId: string) => {
        if (!isAuthenticated || !privateKey) return;
        setIsLoadingMessages(true);
        try {
            const data = await api.getMessages(userId);
            const sorted = data.reverse();
            
            // Decrypt all messages
            const decryptedMessages = await Promise.all(sorted.map(m => decryptSingleMessage(m)));
            setMessages(decryptedMessages);
        } catch (err) {
            console.error("Failed to fetch messages", err);
        } finally {
            setIsLoadingMessages(false);
        }
    }, [isAuthenticated, privateKey, decryptSingleMessage]);

useEffect(() => {
    if (!isAuthenticated) return;

    const loadData = async () => {
        await fetchConversations();
    };

    loadData();
}, [isAuthenticated, fetchConversations]);



const userId = activeConversation?.user_id;

useEffect(() => {
    if (!userId) return;

    const loadMessages = async () => {
        await fetchMessages(userId);
    };

    loadMessages();
}, [userId, fetchMessages]);

    const activeConversationRef = useRef<Conversation | null>(null);
    useEffect(() => {
        activeConversationRef.current = activeConversation;
    }, [activeConversation]);

    // WebSocket implementation
    useEffect(() => {
        if (!isAuthenticated || !user || !privateKey) return;

        const token = api.getToken();
        let socket: WebSocket | null = null;
        let reconnectTimeout: any = null;

        const connect = () => {
            socket = new WebSocket(`wss://whisperbox.koyeb.app/ws?token=${token}`);
            ws.current = socket;

            socket.onopen = () => {
                console.log("WebSocket connected");
            };

            socket.onmessage = async (event) => {
                const data = JSON.parse(event.data);
                
                if (data.type === 'message.receive') {
                    const rawMessage: Message = {
                        id: data.id,
                        from_user_id: data.from_user_id,
                        to_user_id: data.to_user_id,
                        payload: data.payload,
                        delivered: data.delivered,
                        created_at: data.created_at
                    };
                    const decryptedMessage = await decryptSingleMessage(rawMessage);
                    
                    const currentActive = activeConversationRef.current;
                    if (currentActive && (rawMessage.from_user_id === currentActive.user_id || rawMessage.to_user_id === currentActive.user_id)) {
                        setMessages(prev => [...prev, decryptedMessage]);
                    }
                    fetchConversations();
                } else if (data.type === 'message.delivered') {
                    const { message_id } = data;
                    setMessages(prev => prev.map(m => m.id === message_id ? { ...m, delivered: true } : m));
                }
            };

            socket.onclose = () => {
                console.log("WebSocket closed. Attempting to reconnect in 3s...");
                reconnectTimeout = setTimeout(connect, 3000);
            };
        };

        connect();

        return () => {
            if (reconnectTimeout) clearTimeout(reconnectTimeout);
            if (socket) {
                socket.onclose = null; // Prevent reconnection on intentional close
                socket.close();
            }
        };
    }, [isAuthenticated, user, privateKey, fetchConversations, decryptSingleMessage]);

    const sendMessage = async (text: string) => {
    if (!activeConversation || !user || !privateKey) return;

    const { public_key: recipientPubKeyBase64 } = await api.getUserPublicKey(activeConversation.user_id)
    const recipientPubKey = await crypto.importPublicKey(recipientPubKeyBase64)
    const ownPubKey = await crypto.importPublicKey(user.public_key!)
    const encrypted = await crypto.encryptMessage(text, recipientPubKey, ownPubKey)

const payload: MessagePayload = {
    ciphertext: encrypted.encryptedContent,
    iv: encrypted.iv,
    encrypted_key: encrypted.encrypted_key,
    encrypted_key_for_self: encrypted.encrypted_key_for_self,
    encryptedKey: encrypted.encrypted_key,
    encryptedKeyForSelf: encrypted.encrypted_key_for_self
}

    // prefer WebSocket, fall back to REST
    if (ws.current?.readyState === WebSocket.OPEN) {
        ws.current.send(JSON.stringify({
            type: 'message.send',
            to: activeConversation.user_id,
            payload
        }))
        // optimistically add to UI
        const optimistic: DecryptedMessage = {
            id: globalThis.crypto.randomUUID(),
            from_user_id: user.id,
            to_user_id: activeConversation.user_id,
            payload,
            delivered: false,
            created_at: new Date().toISOString(),
            text
        }
        setMessages(prev => [...prev, optimistic])
    } else {
        // REST fallback
        const sentMessage = await api.sendMessage(
            activeConversation.user_id,
            encrypted.encryptedContent,
            encrypted.iv,
            encrypted.encrypted_key,
            encrypted.encrypted_key_for_self
        )
        setMessages(prev => [...prev, { ...sentMessage, text }])
    }
    fetchConversations()
}

    const searchUsers = async (q: string) => {
        return api.searchUsers(q);
    };

    const startNewConversation = (userInfo: UserPublicInfo) => {
        const existing = conversations.find(c => c.user_id === userInfo.id);
        if (existing) {
            setActiveConversation(existing);
        } else {
            const newConv: Conversation = {
                user_id: userInfo.id,
                display_name: userInfo.display_name,
                username: userInfo.username,
                last_message_at: null
            };
            setConversations(prev => [newConv, ...prev]);
            setActiveConversation(newConv);
        }
    };

    return (
        <ChatContext.Provider value={{
            conversations,
            activeConversation,
            messages,
            isLoadingConversations,
            isLoadingMessages,
            setActiveConversation,
            sendMessage,
            searchUsers,
            startNewConversation
        }}>
            {children}
        </ChatContext.Provider>
    );
};

export const useChat = () => {
    const context = useContext(ChatContext);
    if (context === undefined) {
        throw new Error('useChat must be used within a ChatProvider');
    }
    return context;
};
