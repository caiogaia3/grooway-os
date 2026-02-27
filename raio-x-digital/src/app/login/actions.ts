'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'

export async function login(formData: FormData): Promise<{ error?: string; success?: string }> {
    const supabase = await createClient()

    const data = {
        email: formData.get('email') as string,
        password: formData.get('password') as string,
    }

    const { error } = await supabase.auth.signInWithPassword(data)

    if (error) {
        return { error: error.message }
    }

    revalidatePath('/', 'layout')
    redirect('/dashboard')
}

export async function signup(formData: FormData): Promise<{ error?: string; success?: string }> {
    const supabase = await createClient()

    const data = {
        email: formData.get('email') as string,
        password: formData.get('password') as string,
    }

    const { data: authData, error } = await supabase.auth.signUp(data)

    if (error) {
        return { error: error.message }
    }

    if (authData.user && authData.user.identities && authData.user.identities.length === 0) {
        return { error: 'Este email já está cadastrado.' }
    }

    if (authData.session) {
        revalidatePath('/', 'layout')
        redirect('/dashboard')
    } else {
        return { success: 'Conta criada! Verifique sua caixa de entrada para confirmar o email.' }
    }
}
