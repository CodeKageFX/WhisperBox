function openDB(): Promise<IDBDatabase> {
    return new Promise((resolve, reject) => {
        const request = indexedDB.open("talklowk", 1)

        // runs when database is first created or version changes
        request.onupgradeneeded = (event) => {
            const db = (event.target as IDBOpenDBRequest).result
            db.createObjectStore("keys", { keyPath: "id" })
        }

        request.onsuccess = (event) => {
            resolve((event.target as IDBOpenDBRequest).result)
        }

        request.onerror = (event) => {
            reject((event.target as IDBOpenDBRequest).error)
        }
    })
}

export async function savePrivateKeys(userId: string, privateKey: CryptoKey) {
    const db = await openDB()
    return new Promise<void>((resolve, reject) => {
        const tx = db.transaction("keys", "readwrite")
        tx.objectStore("keys").put({id: userId, privateKey})
        tx.oncomplete = () => resolve()
        tx.onerror = () => reject(tx.error)
    })
}

export async function getPrivateKeys(userId: string): Promise<CryptoKey | null> {
    const db = await openDB()
    const tx = db.transaction("keys", "readonly")
    const request = tx.objectStore("keys").get(userId)

    return new Promise((resolve, reject)=> {
        request.onsuccess = ()=> resolve(request.result?.privateKey ?? null);
        request.onerror = ()=> reject(request.error);
    })
}

export async function clearPrivateKeys(userId: string) {
    const db = await openDB()
    const tx = db.transaction("keys", "readwrite")
    tx.objectStore("keys").delete(userId)
}

export async function saveWrappedPrivateKey(userId: string, wrapped: string, salt: string) {
    const db = await openDB() 
    return new Promise<void>((resolve, reject) => {
        const tx = db.transaction("keys", "readwrite")
        tx.objectStore("keys").put({id: `wrapped_${userId}`, wrapped, salt})
        tx.oncomplete = () => resolve()
        tx.onerror = () => reject(tx.error)
    })
}

export async function getWrappedPrivateKey(userId: string)  {
    const db = await openDB()
    const tx = db.transaction("keys", "readonly")
    const request = tx.objectStore("keys").get(`wrapped_${userId}`)

    return new Promise((resolve, reject) => {
        request.onsuccess = () => resolve(request.result ?? null);
        request.onerror = () => reject(request.error);
    });
}