"use client";

import Image from "next/image";
import Link from "next/link";

interface Props {
    className?: string;
    variant?: "3d" | "flat";
}

export default function PublicHeader({ className = "", variant = "3d" }: Props) {
    const logoSrc = variant === "3d" ? "/brand/logo-3d.png" : "/brand/logo-flat.png";

    return (
        <header className={`w-full py-6 px-8 flex justify-between items-center bg-transparent border-b border-white/5 backdrop-blur-sm ${className}`}>
            <Link href="/" className="flex items-center gap-3">
                <div className="relative w-10 h-10">
                    <Image
                        src={logoSrc}
                        alt="Logo Grooway"
                        fill
                        className="object-contain"
                        priority
                    />
                </div>
                <div className="flex flex-col">
                    <span className="text-white font-bold tracking-tighter text-lg leading-tight">GROOWAY</span>
                    <span className="text-neutral-500 text-[10px] uppercase tracking-[0.2em] -mt-1">Performance Digital</span>
                </div>
            </Link>

            <div className="hidden sm:flex items-center gap-2 text-[10px] text-neutral-500 font-medium uppercase tracking-widest border border-white/10 px-3 py-1.5 rounded-full bg-white/5">
                <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                Dossiê Estratégico Seguro
            </div>
        </header>
    );
}
