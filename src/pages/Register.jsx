import React, { useState } from 'react'
import { supabase } from '../services/supabaseClient'
import { useNavigate, Link } from 'react-router-dom'
import { UserPlus, Lock, Mail, User, Phone, Loader2, ArrowLeft } from 'lucide-react'

const Register = () => {
    const [formData, setFormData] = useState({
        email: '',
        password: '',
        nome: '',
        telefone: ''
    })
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState(null)
    const navigate = useNavigate()

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value })
    }

    const handleRegister = async (e) => {
        e.preventDefault()
        setLoading(true)
        setError(null)

        try {
            // 1. Sign Up (Cria User no Supabase Auth)
            const { data: authData, error: authError } = await supabase.auth.signUp({
                email: formData.email,
                password: formData.password,
                options: {
                    data: {
                        nome_completo: formData.nome,
                        telefone: formData.telefone
                    }
                }
            })

            if (authError) throw authError

            // Trigger configurada no BD deve criar Profile e License automaticamente.
            // Se não, faríamos manualmente aqui.

            // alert("Conta criada com sucesso! Faça login.") <-- Bloqueante causava erro
            // Navega após um pequeno delay para garantir que o ciclo de render terminou
            setTimeout(() => {
                navigate('/login?registered=true')
            }, 100)

        } catch (error) {
            setError(error.message)
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="min-h-screen bg-gray-950 flex items-center justify-center p-4 font-sans relative overflow-hidden">

            {/* Background elements */}
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0 pointer-events-none">
                <div className="absolute top-[-10%] right-[-10%] w-[500px] h-[500px] bg-green-900/10 rounded-full blur-[100px]"></div>
                <div className="absolute bottom-[-10%] left-[-10%] w-[500px] h-[500px] bg-blue-900/10 rounded-full blur-[100px]"></div>
            </div>

            <div className="bg-gray-900/80 backdrop-blur-xl p-8 rounded-3xl border border-gray-800 shadow-2xl w-full max-w-md relative z-10">

                <div className="mb-6 flex items-center gap-2">
                    <Link to="/login" className="p-2 -ml-2 text-gray-400 hover:text-white rounded-full hover:bg-gray-800 transition-colors">
                        <ArrowLeft className="w-5 h-5" />
                    </Link>
                    <h1 className="text-2xl font-bold text-white">Criar Conta</h1>
                </div>

                {error && (
                    <div className="bg-red-900/20 border border-red-500/50 text-red-200 p-3 rounded-lg text-sm mb-6 flex items-center gap-2">
                        <Lock className="w-4 h-4" /> {error}
                    </div>
                )}

                <form onSubmit={handleRegister} className="space-y-4">
                    <div className="space-y-1">
                        <label className="text-xs font-bold text-gray-500 uppercase ml-1">Nome Completo</label>
                        <div className="relative">
                            <User className="absolute left-3 top-3 w-5 h-5 text-gray-500" />
                            <input
                                name="nome"
                                type="text"
                                value={formData.nome}
                                onChange={handleChange}
                                className="w-full bg-black/50 border border-gray-700 rounded-xl px-10 py-3 text-white focus:border-green-500 outline-none transition-all placeholder-gray-600"
                                placeholder="Seu Nome"
                                required
                            />
                        </div>
                    </div>

                    <div className="space-y-1">
                        <label className="text-xs font-bold text-gray-500 uppercase ml-1">Telefone (Whatsapp)</label>
                        <div className="relative">
                            <Phone className="absolute left-3 top-3 w-5 h-5 text-gray-500" />
                            <input
                                name="telefone"
                                type="text"
                                value={formData.telefone}
                                onChange={handleChange}
                                className="w-full bg-black/50 border border-gray-700 rounded-xl px-10 py-3 text-white focus:border-green-500 outline-none transition-all placeholder-gray-600"
                                placeholder="(11) 99999-9999"
                                required
                            />
                        </div>
                    </div>

                    <div className="space-y-1">
                        <label className="text-xs font-bold text-gray-500 uppercase ml-1">Email</label>
                        <div className="relative">
                            <Mail className="absolute left-3 top-3 w-5 h-5 text-gray-500" />
                            <input
                                name="email"
                                type="email"
                                value={formData.email}
                                onChange={handleChange}
                                className="w-full bg-black/50 border border-gray-700 rounded-xl px-10 py-3 text-white focus:border-green-500 outline-none transition-all placeholder-gray-600"
                                placeholder="seu@email.com"
                                required
                            />
                        </div>
                    </div>

                    <div className="space-y-1">
                        <label className="text-xs font-bold text-gray-500 uppercase ml-1">Senha</label>
                        <div className="relative">
                            <Lock className="absolute left-3 top-3 w-5 h-5 text-gray-500" />
                            <input
                                name="password"
                                type="password"
                                value={formData.password}
                                onChange={handleChange}
                                className="w-full bg-black/50 border border-gray-700 rounded-xl px-10 py-3 text-white focus:border-green-500 outline-none transition-all placeholder-gray-600"
                                placeholder="Mínimo 6 caracteres"
                                minLength={6}
                                required
                            />
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-green-600 hover:bg-green-500 text-white font-bold py-3 rounded-xl transition-all shadow-lg shadow-green-900/30 flex items-center justify-center gap-2 mt-4 disabled:opacity-50"
                    >
                        {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <>Cadastrar <UserPlus className="w-5 h-5" /></>}
                    </button>
                </form>
            </div>
        </div>
    )
}

export default Register
