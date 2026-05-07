
export type UserProfile = {
    id: string
    username: string
    display_name: string
    public_key: string
    wrapped_private_key: string
    pbkdf2_salt: string
    created_at: string
}

export type UserPublicInfo = {
    id: string
    username: string
    display_name: string
}

export type UserPublicKey = {
    public_key: string
}

export type AuthResponse = {
    access_token: string
    refresh_token: string
    token_type: string
    expires_in: number
    user: UserProfile
}

export type TokenResponse = {
    access_token: string
    token_type: string
    expires_in: number
}

export type MessagePayload = {
    ciphertext: string
    iv: string
    encryptedKey: string
    encryptedKeyForSelf: string
}

export type Message = {
    id: string
    from_user_id: string
    to_user_id: string
    payload: MessagePayload
    delivered: boolean
    created_at: string
}

export type DecryptedMessage = Message & {
    text: string
    isDecrypting?: boolean
    decryptionError?: boolean
}

export type Conversation = {
    user_id: string
    display_name: string
    username: string
    last_message_at: string | null
}