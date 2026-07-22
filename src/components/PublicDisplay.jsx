import React, { useState, useEffect } from 'react'
import { useParams } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import confetti from 'canvas-confetti'
import { Trophy, Gift, Users } from 'lucide-react'
import { supabase } from '../services/supabaseClient'

const PublicDisplay = () => {
    const { evento_id } = useParams()
    const [nomeAtual, setNomeAtual] = useState("Aguardando Início...")
    const [ganhador, setGanhador] = useState(null)
    const [isSorteando, setIsSorteando] = useState(false)
    const [premioAtual, setPremioAtual] = useState("")

    // Phase 2 Metadata
    const [bannerUrl, setBannerUrl] = useState(null)
    const [patrocinadores, setPatrocinadores] = useState([])
    const [count, setCount] = useState(0)
    const [sorteioInfo, setSorteioInfo] = useState(null)

    useEffect(() => {
        carregarMetadados()

        const channel = new BroadcastChannel('sorteio_facil_channel')
        channel.onmessage = (event) => {
            const { type, payload } = event.data
            switch (type) {
                case 'START_ROLLING':
                    setIsSorteando(true)
                    setGanhador(null)
                    if (event.data.prize) setPremioAtual(event.data.prize)
                    // Fetch refreshes prize images just in case
                    carregarMetadados()
                    break
                case 'UPDATE_NAME':
                    if (payload && payload !== '...') setNomeAtual(payload)
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
                    setNomeAtual("Sorteio Studio")
                    break
                default:
                    break
            }
        }

        // Live Participant Counter
        const rtime = supabase.channel('public_room')
            .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'app_participantes' }, payload => {
                setCount(prev => prev + 1)
            })
            .subscribe()

        return () => { channel.close(); supabase.removeChannel(rtime) }
    }, [])

    const carregarMetadados = async () => {
        let sData = null;
        if (evento_id) {
            const { data } = await supabase.from('app_eventos').select('*').eq('id', evento_id).limit(1);
            sData = data;
        } else {
            const { data } = await supabase.from('app_eventos')
               .select('*')
               .eq('ativo', true)
               .order('created_at', { ascending: false })
               .limit(1);
            sData = data;
        }

        if (sData && sData.length > 0) {
            const trg = sData[0]
            if (trg.titulo) setPremioAtual(trg.titulo)
            setSorteioInfo(trg)
            
            if (trg.premio_id) {
                const { data: bData } = await supabase.from('app_brindes').select('imagem_url, nome_brinde').eq('id', trg.premio_id).single()
                if (bData) {
                    setPremioAtual(bData.nome_brinde)
                    if (bData.imagem_url) setBannerUrl(bData.imagem_url)
                }
            }

            const { data: pData } = await supabase.from('app_patrocinadores').select('*').eq('sorteio_id', trg.id)
            if (pData) setPatrocinadores(pData)

            const { count: qt } = await supabase.from('app_participantes').select('*', { count: 'exact', head: true }).eq('evento_id', trg.id)
            if (qt !== null) setCount(qt)
        }
    }

    const dispararConfete = () => {
        const duration = 7 * 1000;
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
        <div className="w-screen h-screen bg-gray-950 flex flex-col items-center justify-center overflow-hidden relative font-sans">
            {/* Background Minimalista Premium */}
            <div className="absolute inset-0 bg-gradient-to-br from-gray-950 to-gray-900 opacity-90" />

            {/* BARRA SUPERIOR (Metadata Master) */}
            <div className="absolute top-0 left-0 w-full flex justify-between items-start p-6 md:p-10 z-30">
                 {/* Prêmio e Capa */}
                 {premioAtual && !isSorteando && !ganhador && (
                     <div className="flex bg-black/60 backdrop-blur-md rounded-2xl border border-gray-800 overflow-hidden shadow-2xl animate-in slide-in-from-top-12 duration-700">
                         {bannerUrl ? (
                             <img src={bannerUrl} alt={premioAtual} className="w-48 h-48 object-cover border-r border-gray-800" />
                         ) : (
                             <div className="w-48 h-48 bg-gradient-to-br from-purple-800 to-indigo-900 flex items-center justify-center border-r border-gray-800"><Gift className="w-16 h-16 text-yellow-500 opacity-80" /></div>
                         )}
                         <div className="p-6 flex flex-col justify-center max-w-sm">
                             <div className="text-[10px] uppercase font-black text-yellow-500 tracking-[0.3em] mb-1">Valendo Agora</div>
                             <h2 className="text-white font-black text-2xl leading-tight">{premioAtual}</h2>
                             {sorteioInfo?.slug && <div className="mt-4 bg-purple-900/40 text-purple-300 text-xs px-3 py-1.5 rounded-lg border border-purple-500/30 font-medium">sorteio-studio.vercel.app/#/participar/{sorteioInfo.slug}</div>}
                         </div>
                     </div>
                 )}
                 {/* Live Counters */}
                 <div className="flex flex-col gap-3 items-end">
                      <div className="flex items-center gap-3 bg-red-900/30 border border-red-500/50 text-red-500 px-4 py-2 rounded-full animate-pulse shadow-lg shadow-red-900/20">
                          <div className="w-3 h-3 bg-red-500 rounded-full" />
                          <span className="font-bold text-sm tracking-widest uppercase">Ao Vivo</span>
                      </div>
                      <div className="flex gap-2 items-center text-gray-400 bg-gray-900/60 backdrop-blur-sm px-4 py-2 rounded-full border border-gray-800">
                          <Users className="w-5 h-5"/>
                          <span className="font-bold font-mono text-white text-lg">{count}</span>
                          <span className="text-xs uppercase ml-1">Na Sala</span>
                      </div>
                 </div>
            </div>

            {/* PATROCINADORES (Rodapé) */}
            {patrocinadores.length > 0 && !isSorteando && !ganhador && (
                 <div className="absolute bottom-0 left-0 w-full bg-black/80 backdrop-blur-xl border-t border-gray-800 p-6 flex flex-col items-center z-40 animate-in slide-in-from-bottom duration-1000">
                     <span className="text-[10px] text-gray-500 uppercase tracking-[0.4em] font-bold mb-4">Apoio Cultural / Patrocínio</span>
                     <div className="flex gap-16 overflow-x-hidden items-center justify-center w-full max-w-7xl">
                         {patrocinadores.map((p, i) => (
                             <div key={i} className="flex flex-col items-center gap-2 grayscale hover:grayscale-0 transition-all opacity-80 hover:opacity-100">
                                 {p.logo_url && <img src={p.logo_url} className="h-16 w-auto object-contain drop-shadow-md rounded bg-white/5 p-1" alt={p.nome} />}
                                 <span className="text-sm font-bold text-gray-400 uppercase tracking-wider">{p.nome}</span>
                             </div>
                         ))}
                     </div>
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
                        <div className="space-y-8 animate-in fade-in zoom-in slide-in-from-bottom-24 duration-700 flex flex-col items-center w-full relative">
                            <div className="absolute inset-0 bg-yellow-500/5 blur-[100px] rounded-full w-full h-full -z-10 animate-pulse"></div>
                            
                            <div className="mb-6 flex flex-col items-center gap-4">
                                <motion.div animate={{ rotate: [0, 2, -2, 0] }} transition={{ repeat: Infinity, duration: 3 }}>
                                    <Trophy className="w-32 h-32 text-yellow-500 drop-shadow-md" />
                                </motion.div>
                                <span className="bg-yellow-500 text-black px-8 py-2 rounded-full text-xl font-black uppercase tracking-widest shadow-lg">
                                    Vencedor(a) Oficial
                                </span>
                            </div>

                            <div className="w-full flex justify-center items-center px-2">
                                <h1
                                    className="font-black text-white leading-none text-center"
                                    style={{
                                        whiteSpace: 'nowrap',
                                        fontSize: `clamp(3rem, ${100 / Math.max(ganhador.nome.length, 10)}vw, 7rem)`,
                                        width: '100%',
                                    }}
                                >
                                    {ganhador.nome}
                                </h1>
                            </div>

                            <div className="flex flex-col gap-4 items-center justify-center mt-6">
                                <p className="text-gray-400 font-bold tracking-widest text-4xl bg-gray-900 border border-gray-800 px-10 py-4 rounded-full shadow-md">
                                    {mascararTelefone(ganhador.telefone)}
                                </p>
                            </div>
                        </div>
                    ) : (
                        // MODO PRE-GAME (IDLE E ROLLING)
                        <div className={`w-full flex justify-center items-center px-2 flex-col gap-6 h-[50vh] relative`}>
                             {isSorteando && <div className="absolute inset-0 bg-gray-800/20 blur-[100px] rounded-full w-full h-full -z-10 animate-pulse"></div>}
                             
                             {isSorteando && (
                                 <motion.div initial={{opacity:0}} animate={{opacity:1}} className="bg-gray-800 border border-gray-700 text-gray-300 px-6 py-2 rounded-full font-bold tracking-widest uppercase text-sm animate-pulse">Sorteando...</motion.div>
                             )}
                             
                             <motion.h1
                                 animate={isSorteando ? { scale: [1, 1.01, 1] } : {}}
                                 transition={{ repeat: Infinity, duration: 0.5 }}
                                 className={`font-black tracking-tight leading-none px-4 text-center transition-colors duration-300 ${
                                     isSorteando 
                                         ? 'text-white' 
                                         : 'text-gray-600 opacity-50'
                                 }`}
                                 style={{
                                     whiteSpace: 'nowrap',
                                     fontSize: `clamp(3rem, ${100 / Math.max(nomeAtual.length, 10)}vw, 7rem)`,
                                     width: '100%',
                                 }}
                             >
                                 {nomeAtual}
                             </motion.h1>
                             
                             {!isSorteando && (
                                 <p className="mt-8 text-2xl text-gray-500 tracking-widest uppercase font-bold">
                                     Aguardando Sorteio
                                 </p>
                             )}
                        </div>
                    )}
                </motion.div>
            </AnimatePresence>
        </div>
    )
}
export default PublicDisplay
