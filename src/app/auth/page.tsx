"use client"

import { useState } from "react"
import { AnimatePresence } from "framer-motion"
import { Button } from "@/components/ui/button"
import Image from "next/image"

import { cn } from "@/lib/utils"
import SignIn from "@/components/Auth/SignIn"
import SignUp from "@/components/Auth/SignUp"

export default function AuthPage() {
    const [isSignUp, setIsSignUp] = useState(false)
    const toggleAuth = () => setIsSignUp(!isSignUp)

    return (
        <div className="flex min-h-screen items-center justify-center bg-background p-4 md:p-10 font-sans select-none overflow-hidden">
            <div className="relative w-full max-w-[850px] min-h-[550px] md:min-h-[600px] rounded-3xl bg-card border border-border shadow-2xl overflow-hidden">
                
                {/* Auth Form Container */}
                <div 
                    className={cn(
                        "h-full w-full md:w-1/2 transition-all duration-700 ease-in-out z-20 py-10 md:py-0",
                        isSignUp ? "md:translate-x-full opacity-100" : "md:translate-x-0 opacity-100"
                    )}
                >
                    <AnimatePresence mode="wait">
                        {!isSignUp ? (
                            <div className="flex flex-col h-full items-center justify-center">
                                <SignIn />
                                <div className="mt-6 md:hidden">
                                    <p className="text-sm text-muted-foreground">
                                        Don&apos;t have an account?{" "}
                                        <button onClick={toggleAuth} className="text-primary font-bold hover:underline">
                                            Sign Up
                                        </button>
                                    </p>
                                </div>
                            </div>
                        ) : (
                            <div className="flex flex-col h-full items-center justify-center">
                                <SignUp />
                                <div className="mt-6 md:hidden">
                                    <p className="text-sm text-muted-foreground">
                                        Already have an account?{" "}
                                        <button onClick={toggleAuth} className="text-primary font-bold hover:underline">
                                            Sign In
                                        </button>
                                    </p>
                                </div>
                            </div>
                        )}
                    </AnimatePresence>
                </div>

                {/* Desktop Overlay Container - Hidden on mobile */}
                <div 
                    className={cn(
                        "hidden md:block absolute top-0 left-1/2 w-1/2 h-full overflow-hidden transition-all duration-700 ease-in-out z-[100]",
                        isSignUp ? "-translate-x-full rounded-r-[80px]" : "rounded-l-[80px]"
                    )}
                >
                    <div 
                        className={cn(
                            "relative -left-full h-full w-[200%] bg-primary text-primary-foreground transition-all duration-700 ease-in-out",
                            isSignUp ? "translate-x-1/2" : "translate-x-0"
                        )}
                    >
                        <div className="flex h-full w-full">
                            {/* Left Panel */}
                            <div className={cn(
                                "flex w-1/2 flex-col items-center justify-center px-12 text-center transition-all duration-700",
                                isSignUp ? "translate-x-0" : "-translate-x-[20%]"
                            )}>
                                <Image src="/logo.png" alt="Logo" width={80} height={80} className="mb-4" />
                                <h1 className="text-3xl font-bold mb-4">Welcome Back!</h1>
                                <p className="mb-8 text-primary-foreground/90 text-sm leading-relaxed max-w-[280px]">
                                    Good to see you again. Your conversations are private, your keys are yours — always.
                                </p>
                                <Button 
                                    variant="outline" 
                                    className="bg-transparent border-2 border-primary-foreground text-primary-foreground hover:bg-primary-foreground hover:text-primary transition-all rounded-full h-11 px-10 font-bold"
                                    onClick={toggleAuth}
                                >
                                    SIGN IN
                                </Button>
                            </div>

                            {/* Right Panel */}
                            <div className={cn(
                                "flex w-1/2 flex-col items-center justify-center px-12 text-center transition-all duration-700",
                                isSignUp ? "translate-x-[20%]" : "translate-x-0"
                            )}>
                                <h1 className="text-3xl font-bold mb-4">Join TalkLowK!</h1>
                                <p className="mb-8 text-primary-foreground/90 text-sm leading-relaxed max-w-[280px]">
                                    Create your account and start chatting securely. No one reads your messages.
                                </p>
                                <Button 
                                    variant="outline" 
                                    className="bg-transparent border-2 border-primary-foreground text-primary-foreground hover:bg-primary-foreground hover:text-primary transition-all rounded-full h-11 px-10 font-bold"
                                    onClick={toggleAuth}
                                >
                                    SIGN UP
                                </Button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
