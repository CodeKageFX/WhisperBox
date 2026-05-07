import { UserProfile } from "@/types"

const BASE_URL = "https://whisperbox.koyeb.app"

// Token helpers
export function saveToken(token: string) {
    localStorage.setItem("token", token)
}
export function getToken(): string | null {
    return localStorage.getItem("token") ?? null
}
export function clearToken() {
    localStorage.clear()
}
export function saveRefreshToken(token: string) {
    localStorage.setItem("refresh_token", token)
}
export function getRefreshToken(): string | null {
    return localStorage.getItem("refresh_token") ?? null
}

// Auth
export async function register(data: {
    username: string,
    display_name: string,
    password:string,
    public_key: string,
    wrapped_private_key: string,
    pbkdf2_salt: string
}) {

    const response = await fetch(`${BASE_URL}/auth/register`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify(data)
    })

    if(!response.ok) {
        if(response.status === 409) {
            throw new Error("Username taken")
        }
        throw new Error("Something went wrong")
    }

    return response.json()
}
export async function login(username: string, password: string) {
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

    if(!response.ok) {
        if(response.status === 401) {
            throw new Error("Invalid Credentials")
        }
        throw new Error("Something went wrong")
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
    if(!response.ok) {
        throw new Error("Something went wrong")
    }

    return response.json()
}
export async function refreshToken(refresh_token: string) {
    const response = await fetch(`${BASE_URL}/auth/refresh`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({refresh_token})
    })
    if(!response.ok) {
        throw new Error("Something went wrong")
    }

    return response.json()
}
export async function logOut(refresh_token: string) {
    const response = await fetch(`${BASE_URL}/auth/logout`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${getToken()}`
        },
        body: JSON.stringify({refresh_token})
    })
    if(!response.ok) {
        throw new Error("Something went wrong")
    }

    return response.json()
}

// Users
export async function searchUsers(q: string) {
    const response = await fetch(`${BASE_URL}/users/search?q=${encodeURIComponent(q)}`, {
        method: "GET",
        headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${getToken()}`
        },
    })

    if(!response.ok) {
        throw new Error("Something went wrong")
    }


    return response.json()
}
export async function getUserPublicKey(userId: string) {
    const response = await fetch(`${BASE_URL}/users/${userId}/public-key`, {
        method: "GET",
        headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${getToken()}`
        },
    })

    if(!response.ok) {
        if(response.status === 404) {
            throw new Error("404 not found")
        }
        throw new Error("Something went wrong")
    }


    return response.json()
}

// Conversations & Messages
export async function getConversations() {
    const response = await fetch(`${BASE_URL}/conversations`, {
        method: "GET",
        headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${getToken()}`
        },
    })

    if(!response.ok) {
        throw new Error("Something went wrong")
    }


    return response.json()
}
export async function getMessages(userId: string) {
    const response = await fetch(`${BASE_URL}/conversations/${userId}/messages`, {
        method: "GET",
        headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${getToken()}`
        },
    })

    if(!response.ok) {
        if(response.status === 404) {
            throw new Error("404 not found")
        }
        throw new Error("Something went wrong")
    }


    return response.json()  
}
export async function sendMessage(
    toUserId: string,
    ciphertext: string,
    iv: string,
    encryptedKey: string,
    encryptedKeyForSelf: string
) {
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

    if (!response.ok) {
        if (response.status === 400) throw new Error("Cannot message yourself")
        if (response.status === 404) throw new Error("User not found")
        throw new Error("Failed to send message")
    }

    return response.json()
}