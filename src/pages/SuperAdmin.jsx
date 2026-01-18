import React, { useEffect, useState } from 'react'
import { supabase } from '../services/supabaseClient'
import { useAuth } from '../contexts/AuthContext'
import { useNavigate } from 'react-router-dom' // Ensure this import is present
import { Users, Search, CheckCircle, XCircle, Clock, ShieldAlert, ArrowLeft, RefreshCw, Calendar, Loader2 } from 'lucide-react'

const SuperAdmin = () => {
    const { user } = useAuth() // This relies on AuthContext being correctly set up
    const navigate = useNavigate()
    const [clients, setClients] = useState([])
    const [loading, setLoading] = useState(true)
    const [searchTerm, setSearchTerm] = useState('')
    const [processing, setProcessing] = useState(null)

    useEffect(() => {
        fetchClients()
    }, [])

    const fetchClients = async () => {
        setLoading(true)
        try {
            // Busca TODOS os usuários (bypass RLS usando service role implícito)
            const { data: profilesData, error: profilesError } = await supabase
                .from('profiles')
                .select('*')
                .order('created_at', { ascending: false })

            if (profilesError) {
                console.error("Erro ao buscar profiles:", profilesError)
                throw profilesError
            }

            // Busca TODAS as licenses
            const { data: licensesData, error: licensesError } = await supabase
                .from('licenses')
                .select('*')

            if (licensesError) {
                console.error("Erro ao buscar licenses:", licensesError)
                throw licensesError
            }

            // Combina os dados manualmente
            const formatted = profilesData.map(p => {
                const license = licensesData?.find(l => l.user_id === p.id)
                return {
                    id: p.id,
                    email: p.email,
                    nome: p.nome_completo || 'Sem Nome',
                    telefone: p.telefone || 'N/A',
                    role: p.role,
                    status: license?.status || 'pending',
                    expires_at: license?.expires_at,
                    plan_type: license?.plan_type || 'trial',
                    created_at: p.created_at
                }
            })

            console.log("Clientes carregados:", formatted.length)
            setClients(formatted)
        } catch (error) {
            console.error("Erro ao buscar clientes:", error)
            alert("Erro ao carregar lista: " + error.message)
        } finally {
            setLoading(false)
        }
    }

    const updateLicense = async (userId, customDate = null, status = 'active', planType = 'pro_mensal') => {
        setProcessing(userId)
        try {
            let expiresAt = null

            if (planType === 'pro_vitalicio') {
                expiresAt = null // Vitalício não expira
            } else if (customDate) {
                // Ajusta para o final do dia selecionado
                const d = new Date(customDate)
                d.setHours(23, 59, 59, 999)
                expiresAt = d.toISOString()
            } else {
                // Fallback (caso precise)
                const d = new Date()
                d.setDate(d.getDate() + 30)
                expiresAt = d.toISOString()
            }

            const { error } = await supabase
                .from('licenses')
                .update({
                    status: status,
                    expires_at: expiresAt,
                    plan_type: planType
                })
                .eq('user_id', userId)

            if (error) throw error

            await fetchClients()
            alert(`Licença atualizada!`)

        } catch (error) {
            alert("Erro ao atualizar: " + error.message)
        } finally {
            setProcessing(null)
        }
    }

    const filteredClients = clients.filter(c =>
        c.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.nome.toLowerCase().includes(searchTerm.toLowerCase())
    )

    return (
        <div className="min-h-screen bg-gray-950 text-white p-6 font-sans">
            <div className="max-w-7xl mx-auto">
                <header className="flex justify-between items-center mb-10 bg-gray-900 p-6 rounded-2xl border border-gray-800 shadow-xl">
                    <div className="flex items-center gap-4">
                        <button onClick={() => navigate('/')} className="p-2 hover:bg-gray-800 rounded-full transition-colors">
                            <ArrowLeft className="w-6 h-6" />
                        </button>
                        <div>
                            <h1 className="text-3xl font-black bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-pink-600">Gestão de Licenças</h1>
                            <p className="text-gray-400 text-sm">Super Admin: {user?.email}</p>
                        </div>
                    </div>
                    <div className="flex gap-4">
                        <div className="relative">
                            <Search className="absolute left-3 top-3 w-4 h-4 text-gray-500" />
                            <input
                                type="text"
                                placeholder="Buscar cliente..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="bg-black/50 border border-gray-700 rounded-xl pl-10 pr-4 py-2 text-sm focus:border-purple-500 outline-none w-64"
                            />
                        </div>
                        <button onClick={fetchClients} className="bg-gray-800 p-2 rounded-xl hover:bg-gray-700">
                            <RefreshCw className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
                        </button>
                    </div>
                </header>

                {loading ? (
                    <div className="text-center py-20 text-gray-500 flex flex-col items-center">
                        <Loader2 className="w-10 h-10 animate-spin mb-4 text-purple-500" />
                        <p>Carregando clientes...</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 gap-4">
                        {filteredClients.length === 0 && <p className="text-center text-gray-500">Nenhum cliente encontrado.</p>}

                        {filteredClients.map(client => (
                            <div key={client.id} className="bg-gray-900/50 border border-gray-800 rounded-2xl p-6 flex flex-col lg:flex-row justify-between items-center gap-6 hover:border-purple-500/30 transition-all">

                                {/* Info Cliente */}
                                <div className="flex items-center gap-6 flex-1 w-full lg:w-auto">
                                    <div className={`w-12 h-12 rounded-full flex items-center justify-center text-xl font-bold ${client.role === 'admin' ? 'bg-purple-600' : 'bg-gray-800'}`}>
                                        {client.nome ? client.nome.charAt(0).toUpperCase() : '?'}
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-lg text-white flex items-center gap-2">
                                            {client.nome}
                                            {client.role === 'admin' && <span className="text-[10px] bg-purple-900/50 text-purple-300 px-2 rounded-full border border-purple-500/50">ADMIN</span>}
                                        </h3>
                                        <p className="text-gray-400 text-sm">{client.email}</p>
                                        <p className="text-gray-500 text-xs mt-1 flex items-center gap-1"><Users className="w-3 h-3" /> {client.telefone}</p>
                                    </div>
                                </div>

                                {/* Status Licença */}
                                <div className="flex flex-col items-center min-w-[200px]">
                                    <div className={`px-4 py-1 rounded-full text-xs font-bold uppercase mb-2 flex items-center gap-2 border ${client.status === 'blocked' ? 'bg-red-900/20 text-red-400 border-red-900' :
                                        !client.expires_at ? 'bg-yellow-500/10 text-yellow-400 border-yellow-500/50 shadow-[0_0_10px_rgba(234,179,8,0.2)]' :
                                            'bg-green-900/20 text-green-400 border-green-900'
                                        }`}>
                                        {client.status === 'blocked' ? <ShieldAlert className="w-3 h-3" /> : !client.expires_at ? <Trophy className="w-3 h-3" /> : <CheckCircle className="w-3 h-3" />}
                                        {client.status === 'blocked' ? 'Bloqueado' : !client.expires_at ? 'Vitalício' : 'Ativo'}
                                    </div>
                                    {client.expires_at ? (
                                        <p className="text-xs text-gray-400">Vence: <strong className="text-white">{new Date(client.expires_at).toLocaleDateString()}</strong></p>
                                    ) : (
                                        client.status !== 'blocked' && <p className="text-xs text-yellow-600 font-bold">Acesso Ilimitado</p>
                                    )}
                                </div>

                                {/* Ações Flexíveis */}
                                <div className="flex flex-col gap-2 items-end">
                                    <div className="flex gap-2 items-center bg-black/20 p-2 rounded-lg border border-gray-800">
                                        <div className="flex flex-col">
                                            <label className="text-[10px] text-gray-500 font-bold uppercase">Validade</label>
                                            <input
                                                type="date"
                                                className="bg-gray-900 border border-gray-700 rounded px-2 py-1 text-xs text-white outline-none focus:border-purple-500"
                                                id={`date-${client.id}`}
                                            />
                                        </div>
                                        <button
                                            onClick={() => {
                                                const dateVal = document.getElementById(`date-${client.id}`).value
                                                if (!dateVal) return alert('Selecione uma data!')
                                                updateLicense(client.id, dateVal, 'active', 'pro_mensal')
                                            }}
                                            className="bg-purple-600 hover:bg-purple-500 px-3 py-2 rounded text-xs font-bold"
                                        >
                                            Aplicar
                                        </button>
                                    </div>

                                    <div className="flex gap-2">
                                        <button
                                            onClick={() => updateLicense(client.id, null, 'active', 'pro_vitalicio')}
                                            className="bg-yellow-600/20 hover:bg-yellow-600/40 text-yellow-500 border border-yellow-600/50 px-3 py-1 rounded text-[10px] font-bold uppercase transition-colors"
                                        >
                                            Tornar Vitalício
                                        </button>

                                        {client.status !== 'blocked' ? (
                                            <button onClick={() => updateLicense(client.id, null, 'blocked')} className="text-red-500 hover:bg-red-900/20 px-3 py-1 rounded text-[10px]">Bloquear</button>
                                        ) : (
                                            <button onClick={() => updateLicense(client.id, null, 'active')} className="text-green-500 hover:bg-green-900/20 px-3 py-1 rounded text-[10px]">Desbloquear</button>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    )
}

function Trophy(props) {
    return (
        <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6" /><path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18" /><path d="M4 22h16" /><path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22" /><path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22" /><path d="M18 2H6v7a6 6 0 0 0 12 0V2Z" /></svg>
    )
}

export default SuperAdmin
