import { conversationChunk, activeConversationChunk, messageChunk, isLoadingMessagesChunk, wsChunk } from './chatStore'
import { privateKeyChunk, userChunk } from './authStore'
import * as api from '@/lib/api'
import * as crypto from '@/lib/crypto'
import { DecryptedMessage, Message } from '../types'

async function decryptSingleMessage(message: Message): Promise<DecryptedMessage> {
    const privateKey = privateKeyChunk.get()
    const user = userChunk.get()

    if (!privateKey) return { ...message, text: "[Encrypted]", decryptionError: true }

    try {
        const isSentByMe = message.from_user_id === user?.id
        const payload = message.payload

        const keyToUse = isSentByMe
            ? (payload.encryptedKeyForSelf)
            : (payload.encryptedKey)

        const ciphertext = payload.ciphertext
        const iv = payload.iv

        if (!keyToUse || !ciphertext || !iv) {
            return { ...message, text: "[Incomplete Payload]", decryptionError: true }
        }

        const text = await crypto.decryptMessage(ciphertext, iv, keyToUse, privateKey)
        return { ...message, text }
    } catch (err) {
        console.error('Decryption failed for message:', message.id, err)
        return { ...message, text: "[Decryption Failed]", decryptionError: true }
    }
}

export async function fetchConversations() {
    await conversationChunk.reload()
}
export async function fetchMessages() {
    const activeConversation = activeConversationChunk.get()
    if (!activeConversation) return

    const currentMessages = messageChunk.get()
    
    // Only show loading state if it's the first fetch for this conversation
    if (currentMessages.length === 0) {
        isLoadingMessagesChunk.set(true)
    }

    try {
        const messages = await api.getMessages(activeConversation.user_id)
        const sorted = messages.reverse()
        const currentMessages = messageChunk.get()

        // Only decrypt messages we don't already have
        const decrypted = await Promise.all(sorted.map(async (m: Message) => {
            const existing = currentMessages.find(c => c.id === m.id)
            if (existing) return existing
            return await decryptSingleMessage(m)
        }))

        // Prevent unnecessary state updates
        if (JSON.stringify(decrypted) !== JSON.stringify(currentMessages)) {
            messageChunk.set(decrypted)
        }
    } catch (err) {
        console.error('fetchMessages error:', err)
    } finally {
        isLoadingMessagesChunk.set(false)
    }
}

export async function sendMessage(text: string) {
    try {
        const activeConversation = activeConversationChunk.get()
        const privateKey = privateKeyChunk.get()
        const user = userChunk.get()

        if (!activeConversation || !privateKey || !user) return

        const { public_key: recipientPublicKeyBase64 } = await api.getUserPublicKey(activeConversation.user_id)

        const encrypted = await crypto.encryptMessage(text, user.public_key, recipientPublicKeyBase64)


        const ws = wsChunk.get()

        if (ws?.readyState === WebSocket.OPEN) {
            ws.send(JSON.stringify({
                event: 'message.send',
                to: activeConversation.user_id,
                payload: {
                    ciphertext: encrypted.cipherText,
                    iv: encrypted.iv,
                    encryptedKey: encrypted.encryptedKey,
                    encryptedKeyForSelf: encrypted.encryptedKeyForSelf
                }
            }))

            const optimistic: DecryptedMessage = {
                id: globalThis.crypto.randomUUID(),
                from_user_id: user.id,
                to_user_id: activeConversation.user_id,
                payload: {
                    ciphertext: encrypted.cipherText,
                    iv: encrypted.iv,
                    encryptedKey: encrypted.encryptedKey,
                    encryptedKeyForSelf: encrypted.encryptedKeyForSelf
                },
                delivered: false,
                created_at: new Date().toISOString(),
                text
            }
            messageChunk.set(prev => [...prev, optimistic])
        } else {
            const sentMessage = await api.sendMessage(
                activeConversation.user_id,
                encrypted.cipherText,
                encrypted.iv,
                encrypted.encryptedKey,
                encrypted.encryptedKeyForSelf
            )
            messageChunk.set(prev => [...prev, { ...sentMessage, text }])
        }

        // move conversation to top
        const conversations = conversationChunk.get().data ?? []
        conversationChunk.mutate(() => [
            { ...activeConversation, last_message_at: new Date().toISOString() },
            ...conversations.filter(c => c.user_id !== activeConversation.user_id)
        ])

    } catch (err) {
        console.error('sendMessage error:', err)
        throw err
    }
}

export function connectWebSocket() {
    const token = api.getToken()
    if (!token) return

    const socket = new WebSocket(`wss://whisperbox.koyeb.app/ws?token=${token}`)
    wsChunk.set(socket)

    // polling fallback every 3 seconds
    const pollInterval = setInterval(() => {
        const active = activeConversationChunk.get()
        const ws = wsChunk.get()
        // Only poll if window is active and WS is NOT open
        if (active && ws?.readyState !== WebSocket.OPEN) {
            fetchMessages()
        }
    }, 3000)

    socket.onmessage = async (event) => {
        const data = JSON.parse(event.data)

        if (data.event === 'message.receive') {
            const rawMessage: Message = {
                id: data.id,
                from_user_id: data.from_user_id,
                to_user_id: data.to_user_id,
                payload: data.payload,
                delivered: data.delivered,
                created_at: data.created_at
            }
            const decrypted = await decryptSingleMessage(rawMessage)
            const active = activeConversationChunk.get()
            if (active && (rawMessage.from_user_id === active.user_id || rawMessage.to_user_id === active.user_id)) {
                messageChunk.set(prev => [...prev, decrypted])
            }
            await fetchConversations()
        }

        if (data.event === 'message.delivered') {
            messageChunk.set(prev =>
                prev.map(m => m.id === data.message_id ? { ...m, delivered: true } : m)
            )
        }
    }

    socket.onclose = () => {
        clearInterval(pollInterval)
        setTimeout(connectWebSocket, 3000)
    }
}

export function disconnectWebSocket() {
    const ws = wsChunk.get()
    if (ws) {
        ws.onclose = null
        ws.close()
        wsChunk.set(null)
    }
}