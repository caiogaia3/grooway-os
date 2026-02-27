'use client'

import { useState } from 'react'
import { login, signup } from './actions'
import { motion } from 'framer-motion'
import { LogIn, UserPlus, Mail, Lock, AlertCircle, Loader2 } from 'lucide-react'

export default function LoginPage() {
    const [error, setError] = useState<string | null>(null)
    const [loading, setLoading] = useState(false)
    const [mode, setMode] = useState<'login' | 'signup'>('login')

    async function handleSubmit(formData: FormData) {
        setError(null)

        if (mode === 'signup') {
            const password = formData.get('password')
            const confirmPassword = formData.get('confirmPassword')
            if (password !== confirmPassword) {
                setError('As senhas não coincidem.')
                return
            }
        }

        setLoading(true)

        try {
            const action = mode === 'login' ? login : signup
            const result = await action(formData)
            if (result?.error) {
                setError(result.error)
            }
        } catch {
            // redirect throws — this is expected on success
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="min-h-screen bg-brand-dark flex items-center justify-center relative overflow-hidden px-4">
            {/* Background Glows */}
            <div className="absolute top-[-200px] left-[-100px] w-[600px] h-[600px] bg-brand-purple/15 blur-[150px] rounded-full pointer-events-none" />
            <div className="absolute bottom-[-200px] right-[-100px] w-[500px] h-[500px] bg-brand-cyan/10 blur-[130px] rounded-full pointer-events-none" />
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] h-[300px] bg-brand-purple/5 blur-[100px] rounded-full pointer-events-none" />

            {/* Grid Pattern */}
            <div
                className="absolute inset-0 pointer-events-none opacity-[0.03]"
                style={{
                    backgroundImage: 'linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)',
                    backgroundSize: '60px 60px',
                }}
            />

            <motion.div
                initial={{ opacity: 0, y: 30, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
                className="w-full max-w-md relative z-10"
            >
                {/* Card */}
                <div className="liquid-glass p-8 md:p-10 rounded-3xl">
                    {/* Logo + Header */}
                    <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2, duration: 0.5 }}
                        className="text-center mb-10"
                    >
                        <div className="flex justify-center mb-4">
                            <div className="relative">
                                <img
                                    src="/logo-gw.png"
                                    alt="Grooway"
                                    className="w-16 h-16 rounded-2xl object-cover shadow-lg shadow-brand-purple/30"
                                />
                                <div className="absolute -inset-1 bg-gradient-to-r from-brand-purple to-brand-cyan rounded-2xl blur opacity-20 -z-10" />
                            </div>
                        </div>
                        <h1 className="text-2xl font-bold text-white tracking-wide">
                            Grooway<span className="text-brand-cyan">OS</span>
                        </h1>
                        <p className="text-slate-400 text-sm mt-2">
                            {mode === 'login' ? 'Acesse seu painel de controle' : 'Crie sua conta'}
                        </p>
                    </motion.div>

                    {/* Error Message */}
                    {error && (
                        <motion.div
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="flex items-center gap-2 p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm mb-6"
                        >
                            <AlertCircle className="w-4 h-4 flex-shrink-0" />
                            <span>{error}</span>
                        </motion.div>
                    )}

                    {/* Form */}
                    <form action={handleSubmit} className="space-y-5">
                        <div className="space-y-1.5">
                            <label htmlFor="email" className="text-sm font-medium text-slate-300 pl-1">
                                Email
                            </label>
                            <div className="relative">
                                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                                <input
                                    id="email"
                                    name="email"
                                    type="email"
                                    required
                                    placeholder="seu@email.com"
                                    className="w-full pl-10 pr-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-slate-500 focus:outline-none focus:border-brand-purple/50 focus:ring-1 focus:ring-brand-purple/30 transition-all duration-300 text-sm"
                                />
                            </div>
                        </div>

                        <div className="space-y-1.5">
                            <label htmlFor="password" className="text-sm font-medium text-slate-300 pl-1">
                                Senha
                            </label>
                            <div className="relative">
                                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                                <input
                                    id="password"
                                    name="password"
                                    type="password"
                                    required
                                    minLength={6}
                                    placeholder="••••••••"
                                    className="w-full pl-10 pr-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-slate-500 focus:outline-none focus:border-brand-purple/50 focus:ring-1 focus:ring-brand-purple/30 transition-all duration-300 text-sm"
                                />
                            </div>
                        </div>

                        {mode === 'signup' && (
                            <motion.div
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: 'auto' }}
                                className="space-y-1.5"
                            >
                                <label htmlFor="confirmPassword" className="text-sm font-medium text-slate-300 pl-1">
                                    Confirmar Senha
                                </label>
                                <div className="relative">
                                    <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                                    <input
                                        id="confirmPassword"
                                        name="confirmPassword"
                                        type="password"
                                        required
                                        minLength={6}
                                        placeholder="••••••••"
                                        className="w-full pl-10 pr-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-slate-500 focus:outline-none focus:border-brand-purple/50 focus:ring-1 focus:ring-brand-purple/30 transition-all duration-300 text-sm"
                                    />
                                </div>
                            </motion.div>
                        )}

                        <div className="flex items-center justify-between pt-1 pb-2">
                            <label className="flex items-center gap-2 cursor-pointer group">
                                <div className="relative flex items-center justify-center">
                                    <input
                                        type="checkbox"
                                        name="rememberMe"
                                        defaultChecked
                                        className="peer sr-only"
                                    />
                                    <div className="w-4 h-4 rounded border border-white/20 bg-white/5 peer-checked:bg-brand-cyan peer-checked:border-brand-cyan transition-colors" />
                                    <svg className="absolute w-3 h-3 text-brand-dark opacity-0 peer-checked:opacity-100 transition-opacity pointer-events-none" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                                        <polyline points="20 6 9 17 4 12"></polyline>
                                    </svg>
                                </div>
                                <span className="text-sm text-slate-400 group-hover:text-slate-300 transition-colors">Lembre-se de mim</span>
                            </label>

                            {mode === 'login' && (
                                <button type="button" className="text-sm text-brand-cyan hover:text-brand-cyan/80 transition-colors">
                                    Esqueceu a senha?
                                </button>
                            )}
                        </div>

                        {/* Submit Button */}
                        <motion.button
                            type="submit"
                            disabled={loading}
                            whileHover={{ scale: loading ? 1 : 1.02 }}
                            whileTap={{ scale: loading ? 1 : 0.98 }}
                            className="w-full py-3.5 rounded-xl font-semibold text-sm relative overflow-hidden transition-all duration-300 disabled:opacity-60 disabled:cursor-not-allowed group"
                            style={{
                                background: 'linear-gradient(135deg, #7c3aed 0%, #4f46e5 50%, #06b6d4 100%)',
                                boxShadow: '0 0 20px rgba(124, 58, 237, 0.3)',
                            }}
                        >
                            {/* Shine effect */}
                            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700" />

                            <span className="relative flex items-center justify-center gap-2 text-white">
                                {loading ? (
                                    <Loader2 className="w-4 h-4 animate-spin" />
                                ) : mode === 'login' ? (
                                    <LogIn className="w-4 h-4" />
                                ) : (
                                    <UserPlus className="w-4 h-4" />
                                )}
                                {loading
                                    ? 'Processando...'
                                    : mode === 'login'
                                        ? 'Entrar'
                                        : 'Criar conta'}
                            </span>
                        </motion.button>
                    </form>

                    {/* Toggle Mode */}
                    <div className="mt-8 text-center">
                        <p className="text-slate-500 text-sm">
                            {mode === 'login' ? 'Não tem uma conta?' : 'Já tem uma conta?'}
                            <button
                                type="button"
                                onClick={() => {
                                    setMode(mode === 'login' ? 'signup' : 'login')
                                    setError(null)
                                }}
                                className="ml-1.5 text-brand-cyan hover:text-brand-cyan/80 font-medium transition-colors duration-200"
                            >
                                {mode === 'login' ? 'Cadastre-se' : 'Fazer login'}
                            </button>
                        </p>
                    </div>
                </div>

                {/* Footer */}
                <p className="text-center text-slate-600 text-xs mt-6">
                    © 2026 Grooway · Agency Control
                </p>
            </motion.div>
        </div>
    )
}
