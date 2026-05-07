"use client"

import SideBar from "@/components/Chat/SideBar";
import { MessageSquareIcon } from "lucide-react";
import Image from "next/image";
import { useChunkValue } from "stunk/react";
import { activeConversationChunk } from "@/store/chatStore";
import { isAuthenticatedChunk, isLoadingChunk } from "@/store/authStore";
import ChatHeader from "@/components/Chat/ChatHeader";
import MessageList from "@/components/Chat/MessageList";
import LogoWatermark from "@/components/LogoWaterMark";
import ChatBox from "@/components/Chat/ChatBox";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { Chunk } from "stunk";
import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

export default function Home() {
    const activeConversation = useChunkValue(activeConversationChunk)
    const isLoading = useChunkValue(isLoadingChunk)
    const isAuthenticated = useChunkValue(isAuthenticatedChunk as unknown as Chunk<boolean>)
    const router = useRouter()

    useEffect(() => {
        if (!isLoading && !isAuthenticated) {
            router.push('/auth')
        }
    }, [isLoading, isAuthenticated, router])

    if (isLoading) {
        return (
            <div className="h-screen w-screen flex items-center justify-center bg-background">
                <div className="flex flex-col items-center gap-4">
                    <Image src="/logo.png" alt="Logo" width={60} height={60} />
                    <Loader2 className="size-6 animate-spin text-primary" />
                    <p className="text-sm text-muted-foreground">Loading TalkLowK...</p>
                </div>
            </div>
        )
    }

    if (!isAuthenticated) return null

    return (
        <main className="h-screen flex overflow-hidden bg-background">
            {/* Sidebar - Hidden on mobile if a chat is active */}
            <div className={cn(
                "h-full w-full md:w-[400px] shrink-0 border-r border-border md:block",
                activeConversation ? "hidden" : "block"
            )}>
                <SideBar />
            </div>

            {/* Chat Area - Hidden on mobile if no chat is active */}
            <section className={cn(
                "flex-1 z-30 relative flex flex-col h-full overflow-hidden",
                !activeConversation ? "hidden md:flex" : "flex"
            )}>
                {!activeConversation ? (
                    <div className="flex-1 flex items-center justify-center p-6 text-center">
                        <div className="flex flex-col gap-4 items-center justify-center max-w-sm">
                            <div className="size-20 rounded-3xl bg-primary/10 flex items-center justify-center">
                                <Image src="/logo.png" alt="Logo" width={50} height={50} />
                            </div>
                            <div className="space-y-1">
                                <h1 className="text-2xl font-bold">TalkLowK</h1>
                                <p className="text-sm text-muted-foreground italic">Encrypted, Simple, Fast.</p>
                            </div>
                            <div className="flex flex-col items-center gap-3 bg-card border border-border rounded-2xl p-6 w-full shadow-sm">
                                <MessageSquareIcon className="size-8 text-primary" />
                                <p className="text-xs text-muted-foreground">Select a contact from the sidebar or start a new secure conversation.</p>
                            </div>
                        </div>
                    </div>
                ) : (
                    <div className="flex-1 flex flex-col h-full relative">
                        <ChatHeader />
                        <MessageList />
                        <ChatBox />
                    </div>
                )}
                
                {/* Background Decor */}
                <LogoWatermark />
                <LogoWatermark size={200} opacity="opacity-5" position="-top-5 -left-5" rotate="-rotate-12" />
                <LogoWatermark size={100} opacity="opacity-10" position="-top-10 -right-10" rotate="-rotate-30" />
                <LogoWatermark size={100} opacity="opacity-10" position="inset-0 m-auto" rotate="rotate-30" />
            </section>
        </main>
    )
}