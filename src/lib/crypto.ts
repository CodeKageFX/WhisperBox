export async function generateKeyPair() {
    const keyPair = await window.crypto.subtle.generateKey(
        {
            name: "RSA-OAEP",
            modulusLength: 2048,
            hash: "SHA-256",
            publicExponent: new Uint8Array([1, 0, 1])
        },
        true,
        ["encrypt", "decrypt"]
    )

    return keyPair
}

export function bufferToBase64(buffer: ArrayBuffer | Uint8Array): string {

    const bytes =  buffer instanceof Uint8Array ? buffer : new Uint8Array(buffer)
    let binary = ""

    for(let i = 0; i < bytes.byteLength; i++) {
        binary += String.fromCharCode(bytes[i])
    }
    return btoa(binary)
}

export function base64ToBuffer(base64: string): ArrayBuffer {
    const binary = atob(base64)
    const bytes = new Uint8Array(binary.length)
    for (let i = 0; i < binary.length; i++) {
        bytes[i] = binary.charCodeAt(i)
    }
    return bytes.buffer
}

export async function exportPublicKey(key: CryptoKey) {
    const exported = await window.crypto.subtle.exportKey("spki", key)

    return bufferToBase64(exported)
}

export async function exportPrivateKey(key: CryptoKey) {
   const exported = await window.crypto.subtle.exportKey("pkcs8", key)
   return bufferToBase64(exported)
}

export async function importPublicKey(base64: string): Promise<CryptoKey> {
    const keyPair = await window.crypto.subtle.importKey(
        "spki",
        base64ToBuffer(base64),
        {
            name: "RSA-OAEP",
            hash: "SHA-256"
        },
        true,
        ["encrypt"]
    )

    return keyPair
}

export async function encryptMessage(
    message: string,
    senderPublicKey: string,
    recipientPublicKey: string
) {
    const encodedMessage = new TextEncoder().encode(message)

    const aesKey = await window.crypto.subtle.generateKey(
        {
            name: "AES-GCM",
            length: 256
        },
        true,
        ["encrypt", "decrypt"]
    )

    const iv = window.crypto.getRandomValues(new Uint8Array(12))

    const cipherText = await window.crypto.subtle.encrypt(
        { name: "AES-GCM", iv },
        aesKey,
        encodedMessage
    )

    const rawAesKey = await window.crypto.subtle.exportKey("raw", aesKey)

    const recipientKey = await importPublicKey(recipientPublicKey)

    const encryptedKey = await window.crypto.subtle.encrypt(
        { name: "RSA-OAEP" },
        recipientKey,
        rawAesKey
    )
    const senderKey = await importPublicKey(senderPublicKey)

    const encryptedKeyForSelf = await window.crypto.subtle.encrypt(
        { name: "RSA-OAEP" },
        senderKey,
        rawAesKey
    )

    return {
        cipherText: bufferToBase64(cipherText),
        iv: bufferToBase64(iv),
        encryptedKey: bufferToBase64(encryptedKey),
        encryptedKeyForSelf: bufferToBase64(encryptedKeyForSelf)
    }
}

export async function decryptMessage(
    ciphertext: string,
    iv: string,
    encryptedKey: string,
    privateKey: CryptoKey
) {

    const rawAesKey = await window.crypto.subtle.decrypt(
        { name: "RSA-OAEP" },
        privateKey,
        base64ToBuffer(encryptedKey)
    )

    const aesKey = await window.crypto.subtle.importKey(
        "raw",
        rawAesKey,
        { name: "AES-GCM" },
        false,
        ["decrypt"]
    )

    const decrypted = await window.crypto.subtle.decrypt(
        { name: "AES-GCM", iv: base64ToBuffer(iv) },
        aesKey,
        base64ToBuffer(ciphertext)
    )

    return new TextDecoder().decode(decrypted)
}

export function generateSalt() {
    return window.crypto.getRandomValues(new Uint8Array(16))
}

export async function deriveWrappingKey(
    password: string,
    salt: Uint8Array
): Promise<CryptoKey> {
    const encoder = new TextEncoder()

    const keyMaterial = await window.crypto.subtle.importKey(
        "raw",
        encoder.encode(password),
        "PBKDF2",
        false,
        ["deriveKey"]
    )

    const derivedKey = await window.crypto.subtle.deriveKey(
        {
            name: "PBKDF2",
            salt: salt as BufferSource  ,
            iterations: 100000,
            hash: "SHA-256",
        },
        keyMaterial,
        { name: "AES-KW", length: 256 },
        false,
        ["wrapKey", "unwrapKey"] 
    )

    return derivedKey
}

export async function wrapPrivateKey(
    privateKey: CryptoKey,
    wrappingKey: CryptoKey
): Promise<string> {
    const wrapped = await window.crypto.subtle.wrapKey(
        "pkcs8",
        privateKey,
        wrappingKey,
        "AES-KW"
    )
    return bufferToBase64(wrapped)
}

export async function unwrapPrivateKey(
    wrappedBase64: string,   // from server
    wrappingKey: CryptoKey   // derived from password + salt
): Promise<CryptoKey> {
    return window.crypto.subtle.unwrapKey(
        "pkcs8",                          // format
        base64ToBuffer(wrappedBase64),    // wrapped key bytes
        wrappingKey,                      // AES-KW key
        "AES-KW",                         // unwrapping algorithm
        { name: "RSA-OAEP", hash: "SHA-256" }, // algorithm of unwrapped key
        true,                             // extractable
        ["decrypt"]                       // usages
    )
}