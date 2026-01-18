import React, { useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { supabase } from '../services/supabaseClient'
import PinInput from '../components/PinInput'
import { Lock, AlertCircle, CheckCircle, Loader2 } from 'lucide-react'

const ChangePinPage = () => {
    const navigate = useNavigate()
    const location = useLocation()
    const { userId, firstLogin } = location.state || {}

    const [newPin, setNewPin] = useState('')
    const [confirmPin, setConfirmPin] = useState('')
    const [step, setStep] = useState(1) // 1 = novo PIN, 2 = confirmar PIN
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState('')
    const [success, setSuccess] = useState(false)

    const handleNewPinComplete = () => {
        if (newPin === '1234') {
            setError('Você não pode usar o PIN padrão (1234). Escolha outro.')
            setNewPin('')
            return
        }
        setError('')
        setStep(2)
    }

    const handleConfirmPinComplete = async () => {
        if (newPin !== confirmPin) {
            setError('Os PINs não coincidem. Tente novamente.')
            setConfirmPin('')
            setStep(1)
            setNewPin('')
            return
        }

        setLoading(true)
        setError('')

        try {
            // Atualiza o PIN no banco
            const { error: updateError } = await supabase
                .from('profiles')
                .update({
                    pin: newPin,
                    pin_changed: true
                })
                .eq('id', userId)

            if (updateError) throw updateError

            setSuccess(true)

            // Redireciona após 2 segundos
            setTimeout(() => {
                navigate('/')
            }, 2000)

        } catch (err) {
            console.error('Erro ao atualizar PIN:', err)
            setError('Erro ao salvar novo PIN. Tente novamente.')
            setStep(1)
            setNewPin('')
            setConfirmPin('')
        } finally {
            setLoading(false)
        }
    }

    React.useEffect(() => {
        if (step === 1 && newPin.length === 4) {
            handleNewPinComplete()
        }
    }, [newPin])

    React.useEffect(() => {
        if (step === 2 && confirmPin.length === 4) {
            handleConfirmPinComplete()
        }
    }, [confirmPin])

    if (success) {
        return (
            <div className="min-h-screen bg-gray-950 flex items-center justify-center p-4">
                <div className="bg-gray-900 rounded-3xl border border-green-500/50 shadow-2xl p-8 max-w-md w-full text-center">
                    <div className="bg-green-600/20 p-4 rounded-full w-20 h-20 mx-auto mb-6 flex items-center justify-center">
                        <CheckCircle className="w-12 h-12 text-green-400" />
                    </div>
                    <h1 className="text-2xl font-bold text-white mb-2">PIN Alterado!</h1>
                    <p className="text-gray-400">Redirecionando...</p>
                </div>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-gray-950 flex items-center justify-center p-4">
            <div className="bg-gray-900 rounded-3xl border border-gray-800 shadow-2xl p-8 max-w-md w-full">

                {/* Ícone */}
                <div className="flex justify-center mb-6">
                    <div className="bg-purple-600/20 p-4 rounded-full">
                        <Lock className="w-12 h-12 text-purple-400" />
                    </div>
                </div>

                {/* Título */}
                <h1 className="text-2xl font-bold text-white text-center mb-2">
                    {firstLogin ? 'Primeiro Acesso' : 'Trocar PIN'}
                </h1>
                <p className="text-gray-500 text-center mb-8 text-sm">
                    {step === 1
                        ? 'Escolha um novo PIN de 4 dígitos'
                        : 'Digite novamente para confirmar'}
                </p>

                {/* Input de PIN */}
                <div className="mb-6">
                    <PinInput
                        value={step === 1 ? newPin : confirmPin}
                        onChange={step === 1 ? setNewPin : setConfirmPin}
                        disabled={loading}
                    />
                </div>

                {/* Indicador de Etapa */}
                <div className="flex justify-center gap-2 mb-6">
                    <div className={`w-2 h-2 rounded-full ${step === 1 ? 'bg-purple-500' : 'bg-gray-700'}`} />
                    <div className={`w-2 h-2 rounded-full ${step === 2 ? 'bg-purple-500' : 'bg-gray-700'}`} />
                </div>

                {/* Botão Voltar (apenas step 2) */}
                {step === 2 && (
                    <button
                        onClick={() => {
                            setStep(1)
                            setConfirmPin('')
                            setError('')
                        }}
                        className="w-full mb-4 text-gray-400 text-sm hover:text-white"
                    >
                        ← Voltar e corrigir PIN
                    </button>
                )}

                {/* Mensagem de Erro */}
                {error && (
                    <div className="bg-red-900/20 border border-red-500/50 rounded-xl p-3 mb-4 flex items-center gap-2">
                        <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0" />
                        <p className="text-red-400 text-sm">{error}</p>
                    </div>
                )}

                {/* Loading */}
                {loading && (
                    <div className="flex items-center justify-center gap-2 text-purple-400">
                        <Loader2 className="w-5 h-5 animate-spin" />
                        <span className="text-sm">Salvando...</span>
                    </div>
                )}

                {/* Dica */}
                {!error && !loading && (
                    <div className="bg-gray-800/50 rounded-xl p-3 text-center">
                        <p className="text-gray-400 text-xs">
                            {step === 1
                                ? '⚠️ Não use o PIN padrão (1234)'
                                : '✓ Confirme o PIN digitado anteriormente'}
                        </p>
                    </div>
                )}
            </div>
        </div>
    )
}

export default ChangePinPage
