export async function generateKeyPair(): Promise<CryptoKeyPair> {
    const keyPair = await window.crypto.subtle.generateKey(
        {
            name: "RSA-OAEP",
            modulusLength: 2048,
            publicExponent: new Uint8Array([1, 0, 1]),
            hash: "SHA-256"
        },
        true,
        ["encrypt", "decrypt"]
    )
    return keyPair
}

export async function exportPublicKey(key: CryptoKey): Promise<string> {
    const exported = await window.crypto.subtle.exportKey(
        "spki",
        key
    )
    return bufferToBase64(exported)
}

export async function exportPrivateKey(key: CryptoKey): Promise<string> {
    const exported = await window.crypto.subtle.exportKey(
        "pkcs8",
        key
    )
    return bufferToBase64(exported)
}

export async function importPublicKey(key: string): Promise<CryptoKey> {
    const exported = await window.crypto.subtle.importKey(
        "spki",
        base64ToBuffer(key),
        {
            name: "RSA-OAEP",
            hash: "SHA-256"
        },
        true,
        ["encrypt"]
    )
    return exported
}

export async function importPrivateKey(key: string): Promise<CryptoKey> {
    const exported = await window.crypto.subtle.importKey(
        "pkcs8",
        base64ToBuffer(key),
        {
            name: "RSA-OAEP",
            hash: "SHA-256"
        },
        true,
        ["decrypt"]
    )
    return exported
}

export function bufferToBase64(buffer: ArrayBuffer | Uint8Array): string {
    const bytes = buffer instanceof Uint8Array ? buffer : new Uint8Array(buffer)
    let binary = ""
    for (let i = 0; i < bytes.byteLength; i++) {
        binary += String.fromCharCode(bytes[i])
    }
    return btoa(binary)
}

export function base64ToBuffer(base64: string): ArrayBuffer {
    if (!base64) {
        throw new Error("base64ToBuffer received undefined or empty input");
    }
    const binary = atob(base64)
    const bytes = new Uint8Array(binary.length)
    for (let i = 0; i < binary.length; i++) {
        bytes[i] = binary.charCodeAt(i)
    }
    return bytes.buffer
}

export async function encryptMessage(
    message: string,
    recipientPublicKey: CryptoKey,
    senderPublicKey: CryptoKey
): Promise<{
    encryptedContent: string
    encrypted_key: string
    encrypted_key_for_self: string
    iv: string
}> {
    const encoder = new TextEncoder()
    const data = encoder.encode(message)
    const iv = window.crypto.getRandomValues(new Uint8Array(12))

    const symKey = await window.crypto.subtle.generateKey(
        { name: "AES-GCM", length: 256 },
        true,
        ["encrypt", "decrypt"]
    )

    const exportedSymKey = await window.crypto.subtle.exportKey("raw", symKey)

    // encrypt AES key for recipient
    const encrypted_key = await window.crypto.subtle.encrypt(
        { name: "RSA-OAEP" },
        recipientPublicKey,
        exportedSymKey
    )

    // encrypt AES key for self
    const encrypted_key_for_self = await window.crypto.subtle.encrypt(
        { name: "RSA-OAEP" },
        senderPublicKey,
        exportedSymKey
    )

    const encryptedContent = await window.crypto.subtle.encrypt(
        { name: "AES-GCM", iv },
        symKey,
        data
    )

    return {
        encryptedContent: bufferToBase64(encryptedContent),
        encrypted_key: bufferToBase64(encrypted_key),
        encrypted_key_for_self: bufferToBase64(encrypted_key_for_self),
        iv: bufferToBase64(iv)
    }
}

export async function decryptMessage(encryptedContent: string, encryptedKey: string, iv: string, privateKey: CryptoKey): Promise<string> {
    const symKeyBytes = await window.crypto.subtle.decrypt(
        { name: "RSA-OAEP" },
        privateKey,
        base64ToBuffer(encryptedKey)
    )

    const symKey = await window.crypto.subtle.importKey(
        "raw",
        symKeyBytes,
        { name: "AES-GCM" },
        false,
        ["decrypt"]
    )

    const decryptedData = await window.crypto.subtle.decrypt(
        {
            name: "AES-GCM",
            iv: base64ToBuffer(iv)
        },
        symKey,
        base64ToBuffer(encryptedContent)
    )

    const decoder = new TextDecoder()
    return decoder.decode(decryptedData)
}

export async function deriveWrappingKey(password: string, salt: Uint8Array): Promise<CryptoKey> {
    const encoder = new TextEncoder()
    const keyMaterial = await window.crypto.subtle.importKey(
        "raw",
        encoder.encode(password),
        "PBKDF2",
        false,
        ["deriveKey"]
    )

    return window.crypto.subtle.deriveKey(
        {
            name: "PBKDF2",
            salt: salt as BufferSource,
            iterations: 100000,
            hash: "SHA-256"
        },
        keyMaterial,
        { name: "AES-KW", length: 256 }, // proper AES-KW
        false,
        ["wrapKey", "unwrapKey"]  // correct usages for AES-KW
    )
}

// wrapPrivateKey becomes much simpler
export async function wrapPrivateKey(privateKey: CryptoKey, wrappingKey: CryptoKey): Promise<string> {
    const wrapped = await window.crypto.subtle.wrapKey(
        "pkcs8",
        privateKey,
        wrappingKey,
        "AES-KW"  // no IV needed — AES-KW handles it internally
    )
    return bufferToBase64(wrapped)
}

// unwrapPrivateKey also simpler
export async function unwrapPrivateKey(wrappedKeyBase64: string, wrappingKey: CryptoKey): Promise<CryptoKey> {
    return window.crypto.subtle.unwrapKey(
        "pkcs8",
        base64ToBuffer(wrappedKeyBase64),
        wrappingKey,
        "AES-KW",
        { name: "RSA-OAEP", hash: "SHA-256" },
        true,
        ["decrypt"]
    )
}

export function generateSalt(): Uint8Array {
    return window.crypto.getRandomValues(new Uint8Array(16))
}