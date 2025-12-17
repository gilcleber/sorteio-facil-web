import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import confetti from 'canvas-confetti'
import { Trophy, Gift } from 'lucide-react'

const PublicDisplay = () => {
    const [nomeAtual, setNomeAtual] = useState("Sorteio Fácil")
    const [ganhador, setGanhador] = useState(null)
    const [isSorteando, setIsSorteando] = useState(false)
    const [premioAtual, setPremioAtual] = useState("")

    useEffect(() => {
        const channel = new BroadcastChannel('sorteio_facil_channel')

        channel.onmessage = (event) => {
            const { type, payload } = event.data

            switch (type) {
                case 'START_ROLLING':
                    setIsSorteando(true)
                    setGanhador(null)
                    if (event.data.prize) setPremioAtual(event.data.prize)
                    break

                case 'UPDATE_NAME':
                    setNomeAtual(payload)
                    break

                case 'UPDATE_PRIZE':
                    setPremioAtual(payload)
                    break

                case 'WINNER_SELECTED':
                    setIsSorteando(false)
                    setGanhador(payload)
                    setNomeAtual(payload.nome)
                    if (payload.premio) setPremioAtual(payload.premio)
                    dispararConfete()
                    break

                case 'RESET':
                    setGanhador(null)
                    setIsSorteando(false)
                    setNomeAtual("Sorteio Fácil")
                    break

                case 'START_IDLE':
                    break

                default:
                    break
            }
        }

        return () => {
            channel.close()
        }
    }, [])

    const dispararConfete = () => {
        const duration = 5 * 1000;
        const animationEnd = Date.now() + duration;
        const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 0 };
        const randomInRange = (min, max) => Math.random() * (max - min) + min;

        const interval = setInterval(function () {
            const timeLeft = animationEnd - Date.now();
            if (timeLeft <= 0) return clearInterval(interval);
            const particleCount = 50 * (timeLeft / duration);
            confetti({ ...defaults, particleCount, origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 } });
            confetti({ ...defaults, particleCount, origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 } });
        }, 250);
    }

    const mascararTelefone = (tel) => {
        if (!tel) return ""
        const digits = tel.replace(/\D/g, '')
        if (digits.length < 4) return tel
        const visiblePart = tel.slice(0, -4)
        return visiblePart + "xxxx"
    }

    return (
        <div className="w-screen h-screen bg-black flex flex-col items-center justify-center overflow-hidden p-8 relative">
            {/* Background Dinâmico */}
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-indigo-900/40 via-black to-black" />

            {/* Display do Prêmio (Sempre visível se houver prêmio definido) */}
            {premioAtual && !isSorteando && !ganhador && (
                <div className="absolute top-10 animate-pulse text-yellow-500 font-bold text-2xl uppercase tracking-[0.3em] border border-yellow-500/30 px-6 py-2 rounded-full bg-yellow-900/10 backdrop-blur-sm z-20">
                    Sorteando: {premioAtual}
                </div>
            )}

            <AnimatePresence mode='wait'>
                <motion.div
                    key={isSorteando ? 'rolling' : (ganhador ? 'winner' : 'idle')}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 1.1 }}
                    transition={{ duration: 0.5 }}
                    className="relative z-10 text-center w-full max-w-7xl flex flex-col items-center"
                >
                    {ganhador ? (
                        <div className="space-y-8 animate-in fade-in zoom-in duration-700 flex flex-col items-center w-full">
                            <div className="mb-6 flex flex-col items-center gap-2">
                                <span className="bg-yellow-500 text-black px-8 py-1 rounded-full text-xl font-black uppercase tracking-[0.2em] shadow-[0_0_50px_rgba(234,179,8,0.5)] animate-bounce">
                                    Ganhador(a)
                                </span>
                                {premioAtual && (
                                    <span className="text-yellow-200/80 uppercase font-bold text-sm tracking-widest mt-2 border-t border-yellow-500/30 pt-2">
                                        Prêmio: {premioAtual}
                                    </span>
                                )}
                            </div>

                            {/* Nome Adaptável (Ganhador) */}
                            <div className="w-full flex justify-center items-center px-2" style={{ height: '30vh' }}>
                                <h1
                                    className="font-black text-white neon-text leading-none text-center transition-all duration-300"
                                    style={{
                                        whiteSpace: 'nowrap',
                                        fontSize: `clamp(2rem, ${150 / Math.max(ganhador.nome.length, 10)}vw, 12rem)`,
                                        width: '100%',
                                    }}
                                >
                                    {ganhador.nome}
                                </h1>
                            </div>

                            <div className="flex flex-col gap-4 items-center justify-center text-4xl font-mono text-gray-300 mt-8">
                                <p className="text-primary font-bold tracking-widest text-[5vw] md:text-5xl">
                                    {mascararTelefone(ganhador.telefone)}
                                </p>
                            </div>
                        </div>
                    ) : (
                        // Nome Rolando (Agora também adaptável e menor)
                        <div className="w-full flex justify-center items-center px-2 h-[50vh]">
                            <h1
                                className={`font-black text-white tracking-tighter transition-all duration-75 ${isSorteando ? 'opacity-80 blur-[2px]' : 'opacity-100 neon-text'}`}
                                style={{
                                    whiteSpace: 'nowrap',
                                    // Ajuste para ser "pequenininho" e igual ao gestor: clamp menor e fator de redução maior
                                    fontSize: `clamp(3rem, ${120 / Math.max(nomeAtual.length, 10)}vw, 8rem)`,
                                    width: '100%',
                                }}
                            >
                                {nomeAtual}
                            </h1>
                        </div>
                    )}
                </motion.div>
            </AnimatePresence>
        </div>
    )
}

export default PublicDisplay
