
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY

let supabaseInstance;

if (!supabaseUrl || !supabaseKey) {
    console.error("⚠️ ERRO CRÍTICO: Chaves do Supabase não encontradas! Verifique o arquivo .env")
    // Cliente Mock para não travar a aplicação (White Screen)
    supabaseInstance = {
        auth: {
            getSession: () => Promise.resolve({ data: { session: null }, error: null }),
            onAuthStateChange: () => ({ data: { subscription: { unsubscribe: () => { } } } }),
            signInWithPassword: () => Promise.resolve({ error: { message: "ERRO DE CONFIGURAÇÃO: Chaves do Supabase ausentes no .env." } }),
            signUp: () => Promise.resolve({ error: { message: "ERRO: Backend desconectado." } }),
            signOut: () => Promise.resolve()
        },
        from: () => ({
            select: () => ({ eq: () => ({ single: () => Promise.resolve({ data: null, error: null }) }) }),
            insert: () => Promise.resolve({ error: { message: "Backend desconectado" } }),
            update: () => Promise.resolve({ error: { message: "Backend desconectado" } }),
        })
    }
} else {
    supabaseInstance = createClient(supabaseUrl, supabaseKey)
}

export const supabase = supabaseInstance
