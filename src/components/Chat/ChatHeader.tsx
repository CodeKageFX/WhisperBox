"use client"

import { useChunkValue, useChunk } from "stunk/react"
import { activeConversationChunk } from "@/store/chatStore"
import { Button } from "../ui/button"
import { PhoneIcon, VideoIcon, MoreVerticalIcon, ShieldCheckIcon, ArrowLeftIcon } from "lucide-react"

export default function ChatHeader() {
    const activeConversation = useChunkValue(activeConversationChunk)
    const [, setActive] = useChunk(activeConversationChunk)

    if (!activeConversation) return null

    return (
        <header className="p-4 border-b border-border bg-background/50 backdrop-blur-md flex items-center justify-between z-40">
            <div className="flex items-center gap-3">
                <Button 
                    variant="ghost" 
                    size="icon" 
                    className="md:hidden -ml-2 rounded-full"
                    onClick={() => setActive(null)}
                >
                    <ArrowLeftIcon className="size-5" />
                </Button>
                <div className="size-10 rounded-full bg-primary flex items-center justify-center text-primary-foreground font-bold">
                    {activeConversation.display_name.slice(0, 2).toUpperCase()}
                </div>
                <div>
                    <h2 className="text-sm font-bold flex items-center gap-1">
                        {activeConversation.display_name}
                        <ShieldCheckIcon className="size-3.5 text-primary" />
                    </h2>
                    <p className="text-xs text-muted-foreground">@{activeConversation.username}</p>
                </div>
            </div>

            <div className="flex items-center gap-1">
                <Button variant="ghost" size="icon" className="rounded-full text-muted-foreground hover:text-primary">
                    <PhoneIcon className="size-5" />
                </Button>
                <Button variant="ghost" size="icon" className="rounded-full text-muted-foreground hover:text-primary">
                    <VideoIcon className="size-5" />
                </Button>
                <Button variant="ghost" size="icon" className="rounded-full text-muted-foreground hover:text-primary">
                    <MoreVerticalIcon className="size-5" />
                </Button>
            </div>
        </header>
    )
}
