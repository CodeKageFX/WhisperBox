import { chunk } from "stunk";
import { Conversation, DecryptedMessage } from "../types";
import { asyncChunk } from "stunk/query";
import * as api from "@/lib/api"

export const conversationChunk = asyncChunk<Conversation[]>(
    api.getConversations,
    {
        initialData: [],
        keepPreviousData: true
    }
)
export const activeConversationChunk = chunk<Conversation | null>(null)
export const messageChunk  = chunk<DecryptedMessage[]>([])
export const isLoadingConversationsChunk = chunk<boolean>(false)
export const isLoadingMessagesChunk = chunk<boolean>(false)

export const wsChunk = chunk<WebSocket | null>(null)