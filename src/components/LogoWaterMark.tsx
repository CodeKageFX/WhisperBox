import Image from 'next/image'

interface LogoWatermarkProps {
    size?: number
    opacity?: string
    position?: string
    rotate?: string
}

export default function LogoWatermark({ 
    size = 300,
    opacity = "opacity-5",
    position = "-bottom-10 -right-10",
    rotate = "rotate-12"
}: LogoWatermarkProps) {
    return (
        <Image 
            src="/logo.png" 
            alt="" 
            width={size} 
            height={size} 
            className={`absolute pointer-events-none select-none ${opacity} ${position} ${rotate}`}
        />
    )
}