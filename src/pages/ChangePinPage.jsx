import React, { useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { supabase } from '../services/supabaseClient'
import PinInput from '../components/PinInput'
import { Lock, AlertCircle, CheckCircle, Loader2, Radio } from 'lucide-react'

const ChangePinPage = () => {
    const navigate = useNavigate()
    const location = useLocation()
    const { userId, firstLogin, radioName, radioSlug } = location.state || {}

    const [newPin, setNewPin] = useState('')
    const [confirmPin, setConfirmPin] = useState('')
    const [step, setStep] = useState(1) // 1 = novo PIN, 2 = confirmar PIN
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState('')
    const [success, setSuccess] = useState(false)

        // ... (rest of the logic remains same until render)


        < p className = "text-gray-500 text-center mb-8 text-sm" >
            { step === 1
            ? 'Escolha um novo PIN de 4 dígitos'
            : 'Digite novamente para confirmar'
}
    </p >

    {/* Input de PIN */ }
    < div className = "mb-6" >
        <PinInput
            value={step === 1 ? newPin : confirmPin}
            onChange={step === 1 ? setNewPin : setConfirmPin}
            disabled={loading}
        />
    </div >

    {/* Indicador de Etapa */ }
    < div className = "flex justify-center gap-2 mb-6" >
        <div className={`w-2 h-2 rounded-full ${step === 1 ? 'bg-purple-500' : 'bg-gray-700'}`} />
        <div className={`w-2 h-2 rounded-full ${step === 2 ? 'bg-purple-500' : 'bg-gray-700'}`} />
    </div >

    {/* Botão Voltar (apenas step 2) */ }
{
    step === 2 && (
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
    )
}

{/* Mensagem de Erro */ }
{
    error && (
        <div className="bg-red-900/20 border border-red-500/50 rounded-xl p-3 mb-4 flex items-center gap-2">
            <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0" />
            <p className="text-red-400 text-sm">{error}</p>
        </div>
    )
}

{/* Loading */ }
{
    loading && (
        <div className="flex items-center justify-center gap-2 text-purple-400">
            <Loader2 className="w-5 h-5 animate-spin" />
            <span className="text-sm">Salvando...</span>
        </div>
    )
}

{/* Dica */ }
{
    !error && !loading && (
        <div className="bg-gray-800/50 rounded-xl p-3 text-center">
            <p className="text-gray-400 text-xs">
                {step === 1
                    ? '⚠️ Não use o PIN padrão (1234)'
                    : '✓ Confirme o PIN digitado anteriormente'}
            </p>
        </div>
    )
}
            </div >
        </div >
    )
}

export default ChangePinPage
