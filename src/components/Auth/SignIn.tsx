"use client"
import { motion } from "framer-motion"
import { EyeIcon, EyeOffIcon, Loader2 } from "lucide-react"
import { useState } from "react"
import { Button } from "../ui/button"
import { Input } from "../ui/input"
import Image from "next/image"
import { login } from "@/store/authAction"
import { useRouter } from "next/navigation"

const SignIn = () => {
    const [showPassword, setShowPassword] = useState(false)
    const [username, setUsername] = useState('')
    const [password, setPassword] = useState('')
    const [error, setError] = useState('')
    const [isLoading, setIsLoading] = useState(false)
    const router = useRouter()

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setError('')
        setIsLoading(true)
        try {
            await login(username, password)
            router.push('/')
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        } catch (err: any) {
            setError(err.message || 'Login failed')
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <motion.div
            key="signin"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            className="flex h-full flex-col items-center justify-center px-10 text-center"
        >
            <form className="w-full space-y-4" onSubmit={handleSubmit}>
                <Image src="/logo.png" alt="Logo" width={100} height={100} className="w-fit mx-auto" />
                <h1 className="text-3xl font-bold tracking-tight text-foreground">Sign In</h1>

                {error && (
                    <p className="text-sm text-destructive bg-destructive/10 px-4 py-2 rounded-lg">
                        {error}
                    </p>
                )}

                <div className="space-y-2 text-left">
                    <Input
                        type="text"
                        placeholder="Username: codekage"
                        className="h-11 border-border"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        required
                    />
                    <div className="relative">
                        <Input
                            type={showPassword ? "text" : "password"}
                            placeholder="Password"
                            className="h-11 border-border"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                        />
                        <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                        >
                            {showPassword ? <EyeOffIcon className="size-4" /> : <EyeIcon className="size-4" />}
                        </button>
                    </div>
                </div>

                <Button
                    type="submit"
                    disabled={isLoading}
                    className="w-full h-11 text-base font-semibold rounded-full hover:bg-primary/90 cursor-pointer"
                >
                    {isLoading ? (
                        <><Loader2 className="size-4 animate-spin mr-2" /> Signing in...</>
                    ) : 'SIGN IN'}
                </Button>
            </form>
        </motion.div>
    )
}

export default SignIn