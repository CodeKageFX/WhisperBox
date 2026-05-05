function openDB(): Promise<IDBDatabase> {
    return new Promise((resolve, reject) => {
        const request = indexedDB.open("whisperbox", 1)

        request.onupgradeneeded = (event) => {
            const db = (event.target as IDBOpenDBRequest).result
            db.createObjectStore("keys", { keyPath: "id" })
            db.createObjectStore("messages", { keyPath: "id" })
        }

        request.onsuccess = (event) => {
            resolve((event.target as IDBOpenDBRequest).result)
        }

        request.onerror = (event) => {
            reject((event.target as IDBOpenDBRequest).error)
        }
    })
}

export async function savePrivateKey(userId: string, privateKey: CryptoKey) {
    const db = await openDB()
    const tx = db.transaction("keys", "readwrite")
    tx.objectStore("keys").put({ id: userId, privateKey })
}

export async function getPrivateKey(userId: string): Promise<CryptoKey | null> {
    const db = await openDB()
    const tx = db.transaction("keys", "readonly")
    const request = tx.objectStore("keys").get(userId)

    return new Promise((resolve, reject) => {
        request.onsuccess = () => resolve(request.result?.privateKey ?? null)
        request.onerror = () => reject(request.error)
    })
}

export async function clearPrivateKey(userId: string) {
    const db = await openDB()
    const tx = db.transaction("keys", "readwrite")
    const store = tx.objectStore("keys")
    store.delete(userId)
}

export async function saveWrappedPrivateKey(userId: string, wrapped: string, salt: string) {
    const db = await openDB()
    const tx = db.transaction("keys", "readwrite")
    tx.objectStore("keys").put({ id: `wrapped_${userId}`, wrapped, salt })
}

export async function getWrappedPrivateKey(userId: string): Promise<{ wrapped: string, salt: string } | null> {
    const db = await openDB()
    const tx = db.transaction("keys", "readonly")
    const request = tx.objectStore("keys").get(`wrapped_${userId}`)
    return new Promise((resolve, reject) => {
        request.onsuccess = () => resolve(request.result ?? null)
        request.onerror = () => reject(request.error)
    })
}