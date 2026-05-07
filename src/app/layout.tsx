import type { Metadata } from "next";
import { Outfit } from 'next/font/google'
import { TooltipProvider } from "@/components/ui/tooltip";
import AppInitializer from "@/components/AppInitializer";
import "./globals.css";

const font = Outfit({
    subsets: ['latin'],
    variable: '--font-main',
    weight: ['400', '500', '600', '700']
})

export const metadata: Metadata = {
    title: "TalkLowK | Secure Messaging",
    description: "End-to-end encrypted messaging",
};

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="en" className={`${font.variable} h-full antialiased`}>
            <body className={`${font.className} min-h-full flex flex-col`}>
                <TooltipProvider>
                    <AppInitializer>
                        {children}
                    </AppInitializer>
                </TooltipProvider>
            </body>
        </html>
    );
}