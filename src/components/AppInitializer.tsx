// src/components/AppInitializer.tsx
"use client"

import { useEffect } from "react"
import { initializeAuth } from "../store/authAction"
import { connectWebSocket, disconnectWebSocket, fetchConversations, fetchMessages } from "../store/chatAction"
import { isAuthenticatedChunk } from "@/store/authStore"
import { activeConversationChunk } from "@/store/chatStore"

export default function AppInitializer({ children }: { children: React.ReactNode }) {
    useEffect(() => {
        initializeAuth()
    }, [])

    useEffect(() => {
        const unsub = isAuthenticatedChunk.subscribe((isAuthenticated) => {
            if (isAuthenticated) {
                connectWebSocket()
                fetchConversations()
            } else {
                disconnectWebSocket()
            }
        })
        return unsub
    }, [])

    useEffect(() => {
        const unsub = activeConversationChunk.subscribe((conversation) => {
            if (conversation) fetchMessages()
        })
        return unsub
    }, [])

    return <>{children}</>
}