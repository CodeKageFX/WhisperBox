export type User = {
    id: string
    username: string
    display_name: string
    public_key?: string
}

export type UserProfile = User & {
    wrapped_private_key: string
    pbkdf2_salt: string
    created_at: string
}

export type MessagePayload = {
    ciphertext: string
    iv: string
    // API uses snake_case
    encrypted_key: string
    encrypted_key_for_self: string
    // WebSocket/local uses camelCase
    encryptedKey?: string
    encryptedKeyForSelf?: string
}

export type Message = {
    id: string
    from_user_id: string
    to_user_id: string
    payload: MessagePayload
    delivered: boolean
    created_at: string
}

export type Conversation = {
    user_id: string
    display_name: string
    username: string
    last_message_at: string | null
}

export type AuthResponse = {
    access_token: string
    refresh_token: string
    token_type: string
    expires_in: number
    user: UserProfile
}

export type UserPublicKey = {
    public_key: string
}

export type UserPublicInfo = {
    id: string
    username: string
    display_name: string
}

export type TokenResponse = {
    access_token: string
    token_type: string
    expires_in: number
}