"use client"

import { 
    PlusCircleIcon, 
    SmileIcon, 
    SendHorizontalIcon, 
    MicIcon,
    PaperclipIcon,
    Loader2
} from "lucide-react"
import { Button } from "../ui/button"
import { useState, useRef, useEffect } from "react"
import { sendMessage } from "@/store/chatAction"

const ChatBox = () => {
    const [text, setText] = useState('')
    const [isSending, setIsSending] = useState(false)
    const textareaRef = useRef<HTMLTextAreaElement>(null)

    // Auto-expand height logic
    useEffect(() => {
        const textarea = textareaRef.current
        if (textarea) {
            textarea.style.height = '48px'
            const scrollHeight = textarea.scrollHeight
            textarea.style.height = Math.min(scrollHeight, 200) + 'px'
        }
    }, [text])

    const handleSubmit = async (e?: React.FormEvent) => {
        e?.preventDefault()
        if (!text.trim() || isSending) return

        setIsSending(true)
        try {
            await sendMessage(text.trim())
            setText('')
            if (textareaRef.current) textareaRef.current.style.height = '48px'
        } catch (err) {
            console.error('Failed to send message', err)
        } finally {
            setIsSending(false)
        }
    }

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault()
            handleSubmit()
        }
    }

    return (
        <form 
            onSubmit={handleSubmit}
            className="p-4 bg-background/50 backdrop-blur-md border-t border-border flex items-end gap-3 relative z-40 transition-all duration-300"
        >
            <div className="flex items-center gap-1 pb-1">
                <Button type="button" variant="ghost" size="icon" className="rounded-full hover:bg-accent text-muted-foreground transition-all">
                    <PlusCircleIcon className="size-5" />
                </Button>
                <Button type="button" variant="ghost" size="icon" className="rounded-full hover:bg-accent text-muted-foreground transition-all">
                    <PaperclipIcon className="size-5" />
                </Button>
            </div>

            <div className="relative flex-1 group">
                <Button type="button" variant="ghost" size="icon" className="absolute left-2 bottom-2.5 rounded-full text-muted-foreground hover:text-primary transition-colors z-10">
                    <SmileIcon className="size-5" />
                </Button>
                
                <textarea
                    ref={textareaRef}
                    value={text}
                    onChange={(e) => setText(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder="Type a message..." 
                    disabled={isSending}
                    rows={1}
                    className="w-full min-h-[48px] max-h-[200px] pl-12 pr-12 py-3 bg-card/50 border border-border rounded-2xl focus-visible:ring-2 focus-visible:ring-primary/20 focus-visible:border-primary transition-all resize-none scrollbar-thin scrollbar-thumb-primary/20 scrollbar-track-transparent text-sm leading-relaxed"
                />

                <Button type="button" variant="ghost" size="icon" className="absolute right-2 bottom-2.5 rounded-full text-muted-foreground hover:text-primary transition-colors z-10">
                    <MicIcon className="size-5" />
                </Button>
            </div>

            <Button 
                type="submit" 
                disabled={!text.trim() || isSending}
                size="icon" 
                className="size-12 mb-0.5 shrink-0 rounded-full bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg shadow-primary/20 transition-all hover:scale-105 active:scale-95 disabled:opacity-50 disabled:scale-100"
            >
                {isSending ? (
                    <Loader2 className="size-5 animate-spin" />
                ) : (
                    <SendHorizontalIcon className="size-5" />
                )}
            </Button>
        </form>
    )
}

export default ChatBox;