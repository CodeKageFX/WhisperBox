"use client"

import Image from "next/image"
import { Button } from "../ui/button"
import { Input } from "../ui/input"
import { LogOutIcon, PlusCircleIcon, Loader2 } from "lucide-react"
import { Tooltip, TooltipContent, TooltipTrigger } from "../ui/tooltip"
import { useChunk, useAsyncChunk, useChunkValue } from "stunk/react"
import { activeConversationChunk, conversationChunk, messageChunk, isLoadingMessagesChunk } from "@/store/chatStore"
import { userChunk } from "@/store/authStore"
import { logout } from "@/store/authAction"
import { searchUsers } from "@/lib/api"
import { useState, useEffect, useRef } from "react"
import { UserPublicInfo, Conversation } from "@/types"
import { useRouter } from "next/navigation"

const SideBar = () => {
    const [, setActive] = useChunk(activeConversationChunk)
    const { data: conversations, loading } = useAsyncChunk(conversationChunk)
    const user = useChunkValue(userChunk)
    const router = useRouter()

    // search state
    const [query, setQuery] = useState('')
    const [results, setResults] = useState<UserPublicInfo[]>([])
    const [isSearching, setIsSearching] = useState(false)
    const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)

    // debounced search
    useEffect(() => {
        if (!query.trim()) {
            setResults([])
            return
        }

        if (debounceRef.current) clearTimeout(debounceRef.current)

        debounceRef.current = setTimeout(async () => {
            setIsSearching(true)
            try {
                const users = await searchUsers(query)
                setResults(users)
            } catch (err) {
                console.error('Search failed', err)
            } finally {
                setIsSearching(false)
            }
        }, 500)

        return () => {
            if (debounceRef.current) clearTimeout(debounceRef.current)
        }
    }, [query])

    const handleSelectUser = (userInfo: UserPublicInfo) => {
        messageChunk.set([])
        isLoadingMessagesChunk.set(true)
        const existing = conversations?.find(c => c.user_id === userInfo.id)
        if (existing) {
            setActive(existing)
        } else {
            const newConv: Conversation = {
                user_id: userInfo.id,
                display_name: userInfo.display_name,
                username: userInfo.username,
                last_message_at: null
            }
            conversationChunk.mutate(prev => [newConv, ...(prev ?? [])])
            setActive(newConv)
        }
        setQuery('')
        setResults([])
    }

    const handleLogout = async () => {
        await logout()
        router.push('/auth')
    }

    const displayList = query.trim() ? results : (conversations ?? [])

    return (
        <aside className="bg-card h-screen w-full sticky top-0 flex flex-col overflow-hidden">

            {/* Header */}
            <div className="border-b border-border p-4 sticky top-0 z-20 bg-card">
                <header className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <Image src="/logo.png" alt="Logo" width={40} height={40} />
                        <p className="font-bold text-xl">TalkLowK</p>
                    </div>
                    <Tooltip>
                        <TooltipContent><p>New Chat</p></TooltipContent>
                        <TooltipTrigger asChild>
                            <Button variant="outline" size="icon">
                                <PlusCircleIcon />
                            </Button>
                        </TooltipTrigger>
                    </Tooltip>
                </header>

                <div className="relative mt-4">
                    <Input
                        placeholder="Search users..."
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                    />
                    {isSearching && (
                        <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 size-4 animate-spin text-muted-foreground" />
                    )}
                </div>
            </div>

            {/* Conversation / Search List */}
            <div className="flex-1 overflow-y-auto mt-2 space-y-1 px-2">
                {loading && !query ? (
                    <div className="flex items-center justify-center py-10">
                        <Loader2 className="size-5 animate-spin text-muted-foreground" />
                    </div>
                ) : displayList.length === 0 ? (
                    <p className="text-center text-sm text-muted-foreground py-10">
                        {query ? 'No users found' : 'No conversations yet'}
                    </p>
                ) : (
                    displayList.map((item) => {
                        const isUser = 'username' in item && !('last_message_at' in item)
                        const id = isUser ? (item as UserPublicInfo).id : (item as Conversation).user_id
                        const name = item.display_name

                        return (
                            <div
                                key={id}
                                onClick={() => {
                                    messageChunk.set([])
                                    isLoadingMessagesChunk.set(true)
                                    if (isUser) {
                                        handleSelectUser(item as UserPublicInfo)
                                    } else {
                                        setActive(item as Conversation)
                                    }
                                }}
                                className="flex justify-between items-center border border-border hover:border-primary cursor-pointer rounded-md p-2 relative transition-colors"
                            >
                                <div className="flex items-center gap-3">
                                    <div className="rounded-full text-center bg-primary text-primary-foreground p-3 text-sm font-bold w-10 h-10 flex items-center justify-center">
                                        {name.slice(0, 2).toUpperCase()}
                                    </div>
                                    <div>
                                        <h3 className="text-sm font-bold">{name}</h3>
                                        <p className="text-xs text-muted-foreground">
                                            {isUser ? `@${ (item as UserPublicInfo).username}` : '🔒 Encrypted message'}
                                        </p>
                                    </div>
                                </div>
                                {!isUser && (item as Conversation).last_message_at && (
                                    <time className="text-xs text-muted-foreground">
                                        {new Date((item as Conversation).last_message_at!).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                    </time>
                                )}
                            </div>
                        )
                    })
                )}
            </div>

            {/* Bottom profile + logout */}
            <div className="border-t border-border p-4 flex items-center justify-between bg-card">
                <div className="flex items-center gap-3">
                    <div className="rounded-full bg-primary text-primary-foreground w-9 h-9 flex items-center justify-center text-sm font-bold">
                        {user?.display_name?.slice(0, 2).toUpperCase() ?? 'ME'}
                    </div>
                    <div>
                        <p className="text-sm font-semibold">{user?.display_name}</p>
                        <p className="text-xs text-primary">🔒 Secure Session</p>
                    </div>
                </div>
                <Tooltip>
                    <TooltipContent><p>Logout</p></TooltipContent>
                    <TooltipTrigger asChild>
                        <Button variant="ghost" size="icon" onClick={handleLogout}>
                            <LogOutIcon className="size-4" />
                        </Button>
                    </TooltipTrigger>
                </Tooltip>
            </div>
        </aside>
    )
}

export default SideBar