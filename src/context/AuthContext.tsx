"use client";

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { UserProfile } from '@/app/types';
import * as api from '@/lib/api';
import * as storage from '@/lib/storage';
import * as crypto from '@/lib/crypto';
import { useRouter } from 'next/navigation';

interface AuthContextType {
    user: UserProfile | null;
    privateKey: CryptoKey | null;
    isLoading: boolean;
    isAuthenticated: boolean;
    login: (username: string, password: string) => Promise<void>;
    register: (username: string, password: string, displayName: string) => Promise<void>;
    logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [user, setUser] = useState<UserProfile | null>(null);
    const [privateKey, setPrivateKey] = useState<CryptoKey | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const router = useRouter();

const logout = useCallback(async () => {
    try {
        const refreshToken = api.getRefreshToken()
        if (refreshToken) {
            await api.logOut(refreshToken) // revoke on server
        }
    } catch (err) {
        console.error('Logout error', err)
    } finally {
        api.clearToken()
        setUser(null)
        setPrivateKey(null)
        await storage.clearPrivateKey(user?.id || '')
        router.push('/auth/login')
    }
}, [router, user])

const initializeAuth = useCallback(async () => {
    try {
        const token = api.getToken()
        if (!token) {
            return
        }
        const key = await storage.getPrivateKey(token)
        if (!key) {
            api.clearToken()
            setIsLoading(false)
            return
        }
        const profile = await api.getMe()
        setUser(profile)
        setPrivateKey(key)
    } catch (err) {
        console.error("Auth initialization failed", err)
        api.clearToken()
    } finally {
        setIsLoading(false)
    }
}, [])

useEffect(() => {
    const init = async () => {
        await initializeAuth();
    };
    
    init();
}, [initializeAuth]);


    const login = async (username: string, password: string) => {
        const response = await api.login(username, password);
        const { access_token, refresh_token, user: profile } = response;
        
        api.saveToken(access_token);
        api.saveRefreshToken(refresh_token);
        
        // Unwrap private key
        const salt = crypto.base64ToBuffer(profile.pbkdf2_salt);
        const wrappingKey = await crypto.deriveWrappingKey(password, new Uint8Array(salt));
        const unwrappedKey = await crypto.unwrapPrivateKey(profile.wrapped_private_key, wrappingKey);
        
        setUser(profile);
        setPrivateKey(unwrappedKey);
        await storage.savePrivateKey(profile.id, unwrappedKey);
    };

    const register = async (username: string, password: string, displayName: string) => {
        // 1. Generate KeyPair
        const keyPair = await crypto.generateKeyPair();
        const publicKey = await crypto.exportPublicKey(keyPair.publicKey);
        
        // 2. Wrap Private Key
        const salt = crypto.generateSalt();
        const wrappingKey = await crypto.deriveWrappingKey(password, salt);
        const wrappedKey = await crypto.wrapPrivateKey(keyPair.privateKey, wrappingKey);
        
        // 3. Register
        const response = await api.register({
            username,
            password,
            display_name: displayName,
            public_key: publicKey,
            wrapped_private_key: wrappedKey,
            pbkdf2_salt: crypto.bufferToBase64(salt)
        });

        const { access_token, refresh_token, user: profile } = response;
        api.saveToken(access_token);
        api.saveRefreshToken(refresh_token);
        
        setUser(profile);
        setPrivateKey(keyPair.privateKey);
        await storage.savePrivateKey(profile.id, keyPair.privateKey);
    };

    return (
        <AuthContext.Provider value={{ 
            user, 
            privateKey, 
            isLoading, 
            isAuthenticated: !!user && !!privateKey,
            login,
            register,
            logout
        }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};
