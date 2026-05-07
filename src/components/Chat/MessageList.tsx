"use client"

import { useChunkValue } from "stunk/react"
import { messageChunk, isLoadingMessagesChunk } from "@/store/chatStore"
import { userChunk } from "@/store/authStore"
import { Loader2, CheckIcon, CheckCheckIcon } from "lucide-react"
import { useEffect, useRef } from "react"
import { cn } from "@/lib/utils"

export default function MessageList() {
    const messages = useChunkValue(messageChunk)
    const user = useChunkValue(userChunk)
    const isLoading = useChunkValue(isLoadingMessagesChunk)
    const scrollRef = useRef<HTMLDivElement>(null)

    // auto-scroll to bottom
    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight
        }
    }, [messages])

    if (isLoading && messages.length === 0) {
        return (
            <div className="flex-1 flex items-center justify-center">
                <Loader2 className="size-6 animate-spin text-primary" />
            </div>
        )
    }

    return (
        <div 
            ref={scrollRef}
            className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-thin scrollbar-thumb-primary/20 scrollbar-track-transparent"
        >
            <div className="flex justify-center mb-6">
                <div className="bg-primary/10 text-primary text-[10px] uppercase tracking-wider font-bold px-3 py-1 rounded-full border border-primary/20">
                    End-to-End Encrypted
                </div>
            </div>

            {messages.map((msg) => {
                const isMe = msg.from_user_id === user?.id
                
                return (
                    <div 
                        key={msg.id}
                        className={cn(
                            "flex w-full",
                            isMe ? "justify-end" : "justify-start"
                        )}
                    >
                        <div className={cn(
                            "max-w-[70%] group relative",
                            isMe ? "items-end" : "items-start"
                        )}>
                            <div className={cn(
                                "px-4 py-2.5 rounded-2xl text-sm shadow-sm transition-all duration-200 whitespace-pre-wrap break-words",
                                isMe 
                                    ? "bg-primary text-primary-foreground rounded-tr-none hover:bg-primary/95" 
                                    : "bg-card border border-border text-foreground rounded-tl-none hover:border-primary/30"
                            )}>
                                {msg.text}
                                <div className={cn(
                                    "flex items-center gap-1 mt-1 justify-end opacity-60 text-[10px]",
                                    isMe ? "text-primary-foreground" : "text-muted-foreground"
                                )}>
                                    {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                    {isMe && (
                                        msg.delivered ? (
                                            <CheckCheckIcon className="size-3 text-primary-foreground" />
                                        ) : (
                                            <CheckIcon className="size-3" />
                                        )
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                )
            })}
        </div>
    )
}
