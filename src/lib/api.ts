import { AuthResponse, UserProfile, Conversation, Message, UserPublicKey, UserPublicInfo, TokenResponse } from "@/app/types"

const BASE_URL = "https://whisperbox.koyeb.app"

// api.ts
export function saveToken(token: string) {
    localStorage.setItem("access_token", token)
}
export function getToken(): string | null {
    if (typeof window === "undefined") return null
    return localStorage.getItem("access_token")
}
export function clearToken() {
    localStorage.removeItem("access_token")
}

export function saveRefreshToken(token: string) {
    sessionStorage.setItem("refresh_token", token)
}

export function getRefreshToken(): string | null {
    if (typeof window === "undefined") return null
    return sessionStorage.getItem("refresh_token")
}

export async function register(data: {
    username: string;
    display_name: string;
    password: string;
    public_key: string;
    wrapped_private_key: string;
    pbkdf2_salt: string;
}): Promise<AuthResponse> {
    const response = await fetch(`${BASE_URL}/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data)
    })
    if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || "Registration failed");
    }
    return response.json()
}

export async function login(username: string, password: string): Promise<AuthResponse> {
    const response = await fetch(`${BASE_URL}/auth/login`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            username,
            password
        })
    })

    if (!response.ok) {
        throw new Error("Login failed")
    }

    return response.json()
}

export async function getMe(): Promise<UserProfile> {
    const response = await fetch(`${BASE_URL}/auth/me`, {
        method: "GET",
        headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${getToken()}`
        }
    })

    if (!response.ok) {
        throw new Error("Failed to fetch user profile")
    }

    return response.json()
}

export async function logOut(refresh_token: string): Promise<{ message: string }> {
    const response = await fetch(`${BASE_URL}/auth/logout`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${getToken()}`
        },
        body: JSON.stringify({ refresh_token })
    })
    if (!response.ok) throw new Error("Logout failed")
    clearToken()
    sessionStorage.removeItem("refresh_token")
    return response.json()
}

export async function getUserPublicKey(userId: string): Promise<UserPublicKey> {
    const response = await fetch(`${BASE_URL}/users/${userId}/public-key`, {
        method: "GET",
        headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${getToken()}`
        }
    })

    if (!response.ok) {
        throw new Error("Failed to fetch user public key")
    }

    return response.json()
}

export async function getConversations(): Promise<Conversation[]> {
    const response = await fetch(`${BASE_URL}/conversations`, {
        method: "GET",
        headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${getToken()}`
        }
    })

    if (!response.ok) {
        throw new Error("Failed to fetch conversations")
    }

    return response.json()
}

export async function getMessages(userId: string): Promise<Message[]> {
    const response = await fetch(`${BASE_URL}/conversations/${userId}/messages`, {
        method: "GET",
        headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${getToken()}`
        }
    })

    if (!response.ok) {
        throw new Error("Failed to fetch messages")
    }

    return response.json()
}

export async function sendMessage(
    toUserId: string,
    ciphertext: string,
    iv: string,
    encryptedKey: string,
    encryptedKeyForSelf: string
): Promise<Message> {
    const response = await fetch(`${BASE_URL}/messages`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${getToken()}`
        },
        body: JSON.stringify({
            to: toUserId,
            payload: {
                ciphertext,
                iv,
                encryptedKey,
                encryptedKeyForSelf
            }
        })
    })

    if (!response.ok) throw new Error("Failed to send message")
    return response.json()
}

export async function searchUsers(q: string): Promise<UserPublicInfo[]> {
    const response = await fetch(`${BASE_URL}/users/search?q=${encodeURIComponent(q)}`, {
        headers: { "Authorization": `Bearer ${getToken()}` }
    })
    if (!response.ok) throw new Error("Search failed")
    return response.json()
}

export async function refreshToken(): Promise<TokenResponse> {
    const refresh_token = getRefreshToken()
    if (!refresh_token) throw new Error("No refresh token")
    const response = await fetch(`${BASE_URL}/auth/refresh`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ refresh_token })
    })
    if (!response.ok) throw new Error("Token refresh failed")
    const data = await response.json()
    saveToken(data.access_token)
    return data
}