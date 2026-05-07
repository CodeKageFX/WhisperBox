import { chunk, computed } from "stunk";
import { UserProfile } from "@/types";

export const userChunk = chunk<UserProfile | null>(null)
export const privateKeyChunk = chunk<CryptoKey | null>(null)
export const isAuthenticatedChunk = computed(()=> 
    userChunk.get() !== null && privateKeyChunk.get() !== null
)

export const isLoadingChunk = chunk(true)