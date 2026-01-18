import React, { useState, useEffect } from 'react'
import { supabase } from '../services/supabaseClient'
import { DollarSign, TrendingUp, TrendingDown, Clock, CheckCircle, XCircle, Plus, Loader2 } from 'lucide-react'

const FinancePanel = () => {
    const [payments, setPayments] = useState([])
    const [clients, setClients] = useState([])
    const [loading, setLoading] = useState(true)
    const [showAddPayment, setShowAddPayment] = useState(false)
    const [selectedClient, setSelectedClient] = useState('')
    const [paymentForm, setPaymentForm] = useState({
        amount: '',
        payment_method: 'pix',
        plan_type: 'pro_mensal'
    })

    // Estatísticas
    const [stats, setStats] = useState({
        totalReceived: 0,
        totalPending: 0,
        totalOverdue: 0,
        monthlyRevenue: 0
    })

    useEffect(() => {
        fetchData()
    }, [])

    const fetchData = async () => {
        setLoading(true)
        try {
            // Buscar clientes
            const { data: clientsData } = await supabase
                .from('profiles')
                .select('id, email, nome_completo')
                .order('nome_completo')

            setClients(clientsData || [])

            // Buscar pagamentos
            const { data: paymentsData } = await supabase
                .from('payments')
                .select(`
                    *,
                    profiles (email, nome_completo)
                `)
                .order('created_at', { ascending: false })

            setPayments(paymentsData || [])

            // Calcular estatísticas
            if (paymentsData) {
                const received = paymentsData
                    .filter(p => p.status === 'paid')
                    .reduce((sum, p) => sum + parseFloat(p.amount), 0)

                const pending = paymentsData
                    .filter(p => p.status === 'pending')
                    .reduce((sum, p) => sum + parseFloat(p.amount), 0)

                const overdue = paymentsData
                    .filter(p => p.status === 'overdue')
                    .reduce((sum, p) => sum + parseFloat(p.amount), 0)

                // Receita do mês atual
                const now = new Date()
                const monthlyRevenue = paymentsData
                    .filter(p => {
                        const paidDate = new Date(p.paid_at)
                        return p.status === 'paid' &&
                            paidDate.getMonth() === now.getMonth() &&
                            paidDate.getFullYear() === now.getFullYear()
                    })
                    .reduce((sum, p) => sum + parseFloat(p.amount), 0)

                setStats({ totalReceived: received, totalPending: pending, totalOverdue: overdue, monthlyRevenue })
            }

        } catch (err) {
            console.error('Erro ao carregar dados:', err)
        } finally {
            setLoading(false)
        }
    }

    const handleAddPayment = async () => {
        if (!selectedClient || !paymentForm.amount) {
            alert('Preencha todos os campos')
            return
        }

        try {
            // Chamar função SQL para registrar pagamento e renovar licença
            const { data, error } = await supabase.rpc('register_payment_and_renew', {
                p_user_id: selectedClient,
                p_amount: parseFloat(paymentForm.amount),
                p_plan_type: paymentForm.plan_type,
                p_payment_method: paymentForm.payment_method
            })

            if (error) throw error

            alert('Pagamento registrado e licença renovada!')
            setShowAddPayment(false)
            setPaymentForm({ amount: '', payment_method: 'pix', plan_type: 'pro_mensal' })
            setSelectedClient('')
            fetchData()

        } catch (err) {
            console.error('Erro ao registrar pagamento:', err)
            alert('Erro ao registrar pagamento: ' + err.message)
        }
    }

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-gray-950">
                <Loader2 className="w-10 h-10 text-purple-500 animate-spin" />
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-gray-950 p-6">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="flex justify-between items-center mb-8">
                    <div>
                        <h1 className="text-3xl font-bold text-white mb-2">Controle Financeiro</h1>
                        <p className="text-gray-400">Gestão de pagamentos e receitas</p>
                    </div>
                    <button
                        onClick={() => setShowAddPayment(!showAddPayment)}
                        className="bg-purple-600 hover:bg-purple-500 text-white font-bold py-3 px-6 rounded-xl flex items-center gap-2"
                    >
                        <Plus className="w-5 h-5" />
                        Registrar Pagamento
                    </button>
                </div>

                {/* Estatísticas */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
                    <div className="bg-green-900/20 border border-green-500/50 rounded-2xl p-6">
                        <div className="flex items-center justify-between mb-2">
                            <span className="text-green-400 text-sm font-bold">Recebido</span>
                            <TrendingUp className="w-5 h-5 text-green-400" />
                        </div>
                        <p className="text-3xl font-bold text-white">R$ {stats.totalReceived.toFixed(2)}</p>
                    </div>

                    <div className="bg-yellow-900/20 border border-yellow-500/50 rounded-2xl p-6">
                        <div className="flex items-center justify-between mb-2">
                            <span className="text-yellow-400 text-sm font-bold">Pendente</span>
                            <Clock className="w-5 h-5 text-yellow-400" />
                        </div>
                        <p className="text-3xl font-bold text-white">R$ {stats.totalPending.toFixed(2)}</p>
                    </div>

                    <div className="bg-red-900/20 border border-red-500/50 rounded-2xl p-6">
                        <div className="flex items-center justify-between mb-2">
                            <span className="text-red-400 text-sm font-bold">Atrasado</span>
                            <TrendingDown className="w-5 h-5 text-red-400" />
                        </div>
                        <p className="text-3xl font-bold text-white">R$ {stats.totalOverdue.toFixed(2)}</p>
                    </div>

                    <div className="bg-purple-900/20 border border-purple-500/50 rounded-2xl p-6">
                        <div className="flex items-center justify-between mb-2">
                            <span className="text-purple-400 text-sm font-bold">Mês Atual</span>
                            <DollarSign className="w-5 h-5 text-purple-400" />
                        </div>
                        <p className="text-3xl font-bold text-white">R$ {stats.monthlyRevenue.toFixed(2)}</p>
                    </div>
                </div>

                {/* Formulário de Adicionar Pagamento */}
                {showAddPayment && (
                    <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6 mb-8">
                        <h2 className="text-xl font-bold text-white mb-4">Novo Pagamento</h2>

                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                            <div>
                                <label className="text-sm text-gray-400 mb-2 block">Cliente</label>
                                <select
                                    value={selectedClient}
                                    onChange={(e) => setSelectedClient(e.target.value)}
                                    className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-3 text-white"
                                >
                                    <option value="">Selecione...</option>
                                    {clients.map(client => (
                                        <option key={client.id} value={client.id}>
                                            {client.nome_completo || client.email}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label className="text-sm text-gray-400 mb-2 block">Valor (R$)</label>
                                <input
                                    type="number"
                                    step="0.01"
                                    value={paymentForm.amount}
                                    onChange={(e) => setPaymentForm({ ...paymentForm, amount: e.target.value })}
                                    placeholder="149.70"
                                    className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-3 text-white"
                                />
                            </div>

                            <div>
                                <label className="text-sm text-gray-400 mb-2 block">Plano</label>
                                <select
                                    value={paymentForm.plan_type}
                                    onChange={(e) => setPaymentForm({ ...paymentForm, plan_type: e.target.value })}
                                    className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-3 text-white"
                                >
                                    <option value="pro_mensal">Mensal</option>
                                    <option value="pro_trimestral">Trimestral</option>
                                    <option value="pro_anual">Anual</option>
                                </select>
                            </div>

                            <div>
                                <label className="text-sm text-gray-400 mb-2 block">Método</label>
                                <select
                                    value={paymentForm.payment_method}
                                    onChange={(e) => setPaymentForm({ ...paymentForm, payment_method: e.target.value })}
                                    className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-3 text-white"
                                >
                                    <option value="pix">PIX</option>
                                    <option value="boleto">Boleto</option>
                                    <option value="cartao">Cartão</option>
                                    <option value="dinheiro">Dinheiro</option>
                                </select>
                            </div>
                        </div>

                        <div className="flex gap-2 mt-4">
                            <button
                                onClick={handleAddPayment}
                                className="bg-purple-600 hover:bg-purple-500 text-white font-bold py-2 px-6 rounded-xl"
                            >
                                Registrar e Renovar Licença
                            </button>
                            <button
                                onClick={() => setShowAddPayment(false)}
                                className="bg-gray-800 hover:bg-gray-700 text-white py-2 px-6 rounded-xl"
                            >
                                Cancelar
                            </button>
                        </div>
                    </div>
                )}

                {/* Lista de Pagamentos */}
                <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6">
                    <h2 className="text-xl font-bold text-white mb-4">Histórico de Pagamentos</h2>

                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="border-b border-gray-800">
                                    <th className="text-left text-gray-400 text-sm font-bold py-3 px-4">Cliente</th>
                                    <th className="text-left text-gray-400 text-sm font-bold py-3 px-4">Valor</th>
                                    <th className="text-left text-gray-400 text-sm font-bold py-3 px-4">Status</th>
                                    <th className="text-left text-gray-400 text-sm font-bold py-3 px-4">Método</th>
                                    <th className="text-left text-gray-400 text-sm font-bold py-3 px-4">Vencimento</th>
                                    <th className="text-left text-gray-400 text-sm font-bold py-3 px-4">Pago em</th>
                                </tr>
                            </thead>
                            <tbody>
                                {payments.length === 0 ? (
                                    <tr>
                                        <td colSpan="6" className="text-center text-gray-500 py-8">
                                            Nenhum pagamento registrado
                                        </td>
                                    </tr>
                                ) : (
                                    payments.map(payment => (
                                        <tr key={payment.id} className="border-b border-gray-800 hover:bg-gray-800/50">
                                            <td className="py-4 px-4 text-white">
                                                {payment.profiles?.nome_completo || payment.profiles?.email}
                                            </td>
                                            <td className="py-4 px-4 text-white font-bold">
                                                R$ {parseFloat(payment.amount).toFixed(2)}
                                            </td>
                                            <td className="py-4 px-4">
                                                <span className={`px-3 py-1 rounded-full text-xs font-bold ${payment.status === 'paid' ? 'bg-green-900/20 text-green-400' :
                                                        payment.status === 'pending' ? 'bg-yellow-900/20 text-yellow-400' :
                                                            'bg-red-900/20 text-red-400'
                                                    }`}>
                                                    {payment.status === 'paid' ? 'Pago' : payment.status === 'pending' ? 'Pendente' : 'Atrasado'}
                                                </span>
                                            </td>
                                            <td className="py-4 px-4 text-gray-400 text-sm uppercase">
                                                {payment.payment_method}
                                            </td>
                                            <td className="py-4 px-4 text-gray-400 text-sm">
                                                {new Date(payment.due_date).toLocaleDateString()}
                                            </td>
                                            <td className="py-4 px-4 text-gray-400 text-sm">
                                                {payment.paid_at ? new Date(payment.paid_at).toLocaleDateString() : '-'}
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default FinancePanel
