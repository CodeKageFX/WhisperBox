import * as api from '@/lib/api'
import * as storage from '@/lib/storage'
import * as crypto from '@/lib/crypto'
import { userChunk, privateKeyChunk, isLoadingChunk } from './authStore'

export const initializeAuth = async () => {
    isLoadingChunk.set(true)
    try {
        const token = api.getToken()
        if (!token) return

        const profile = await api.getMe()
        userChunk.set(profile)

        const key = await storage.getPrivateKeys(profile.id)
        if (key) privateKeyChunk.set(key)
    } catch {
        api.clearToken()
    } finally {
        isLoadingChunk.set(false)
    }
}

export const register = async (display_name: string, username: string, password: string) => {
    const keyPair = await crypto.generateKeyPair()
    const salt = crypto.generateSalt()
    const wrappingKey = await crypto.deriveWrappingKey(password, salt)
    const wrappedKey = await crypto.wrapPrivateKey(keyPair.privateKey, wrappingKey)
    const publicKey = await crypto.exportPublicKey(keyPair.publicKey)

    const response = await api.register({
        username,
        display_name,
        password,
        public_key: publicKey,
        wrapped_private_key: wrappedKey,
        pbkdf2_salt: crypto.bufferToBase64(salt)
    })

    const { access_token, refresh_token, user: profile } = response

    api.saveToken(access_token)
    api.saveRefreshToken(refresh_token)

    userChunk.set(profile)
    privateKeyChunk.set(keyPair.privateKey)

    await storage.savePrivateKeys(profile.id, keyPair.privateKey)
    await storage.saveWrappedPrivateKey(profile.id, wrappedKey, crypto.bufferToBase64(salt))
}

export const login = async (username: string, password: string) => {
    const response = await api.login(username, password)
    const { access_token, refresh_token, user: profile } = response

    api.saveToken(access_token)
    api.saveRefreshToken(refresh_token)

    const salt = crypto.base64ToBuffer(profile.pbkdf2_salt)
    const wrappingKey = await crypto.deriveWrappingKey(password, new Uint8Array(salt))
    const privateKey = await crypto.unwrapPrivateKey(profile.wrapped_private_key, wrappingKey)

    userChunk.set(profile)
    privateKeyChunk.set(privateKey)

    await storage.savePrivateKeys(profile.id, privateKey)
}

export const logout = async () => {
    try {
        const refreshToken = api.getRefreshToken()
        if (refreshToken) await api.logOut(refreshToken)
    } catch (err) {
        console.error('Logout error', err)
    } finally {
        api.clearToken()
        userChunk.set(null)
        privateKeyChunk.set(null)
    }
}