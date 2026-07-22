import React, { useMemo } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';
import { Users, Trophy, MapPin, Calendar } from 'lucide-react';
import { motion } from 'framer-motion';

export default function DashboardMetrics({ participantes, historico }) {
    // Calcular estatísticas básicas
    const totalParticipantes = participantes.length;
    const totalSorteios = historico.length;
    
    // Processar dados para o gráfico de crescimento (últimos 7 dias)
    const chartData = useMemo(() => {
        if (!participantes.length) return [];
        
        const counts = {};
        // Pegar os últimos 7 dias até hoje
        for (let i = 6; i >= 0; i--) {
            const d = new Date();
            d.setDate(d.getDate() - i);
            counts[d.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' })] = 0;
        }

        participantes.forEach(p => {
            if (p.created_at) {
                const dateStr = new Date(p.created_at).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' });
                if (counts[dateStr] !== undefined) {
                    counts[dateStr]++;
                }
            }
        });

        return Object.keys(counts).map(date => ({
            name: date,
            Inscritos: counts[date]
        }));
    }, [participantes]);

    // Processar top cidades
    const topCidades = useMemo(() => {
        const counts = {};
        participantes.forEach(p => {
            let cidade = p.cidade || "Outras";
            counts[cidade] = (counts[cidade] || 0) + 1;
        });
        
        return Object.entries(counts)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 5)
            .map(([name, value]) => ({ name, value }));
    }, [participantes]);

    return (
        <div className="space-y-6">
            {/* Cards de Resumo */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="bg-gray-900 border border-gray-800 rounded-xl p-6 shadow-sm relative overflow-hidden">
                    <div className="absolute -right-6 -top-6 text-purple-500/10"><Users size={120} /></div>
                    <div className="flex items-center gap-4 mb-4 relative z-10">
                        <div className="p-3 bg-purple-500/20 text-purple-400 rounded-xl"><Users className="w-6 h-6" /></div>
                        <h3 className="text-gray-400 font-bold text-sm uppercase">Total Inscritos</h3>
                    </div>
                    <p className="text-4xl font-black text-white relative z-10">{totalParticipantes}</p>
                </motion.div>

                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="bg-gray-900 border border-gray-800 rounded-xl p-6 shadow-sm relative overflow-hidden">
                    <div className="absolute -right-6 -top-6 text-pink-500/10"><Trophy size={120} /></div>
                    <div className="flex items-center gap-4 mb-4 relative z-10">
                        <div className="p-3 bg-pink-500/20 text-pink-400 rounded-xl"><Trophy className="w-6 h-6" /></div>
                        <h3 className="text-gray-400 font-bold text-sm uppercase">Sorteios Realizados</h3>
                    </div>
                    <p className="text-4xl font-black text-white relative z-10">{totalSorteios}</p>
                </motion.div>

                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="bg-gray-900 border border-gray-800 rounded-xl p-6 shadow-sm relative overflow-hidden">
                    <div className="absolute -right-6 -top-6 text-blue-500/10"><MapPin size={120} /></div>
                    <div className="flex items-center gap-4 mb-4 relative z-10">
                        <div className="p-3 bg-blue-500/20 text-blue-400 rounded-xl"><MapPin className="w-6 h-6" /></div>
                        <h3 className="text-gray-400 font-bold text-sm uppercase">Cidades Ativas</h3>
                    </div>
                    <p className="text-4xl font-black text-white relative z-10">{topCidades.length}</p>
                </motion.div>
                
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} className="bg-gray-900 border border-gray-800 rounded-xl p-6 shadow-sm relative overflow-hidden">
                    <div className="absolute -right-6 -top-6 text-emerald-500/10"><Calendar size={120} /></div>
                    <div className="flex items-center gap-4 mb-4 relative z-10">
                        <div className="p-3 bg-emerald-500/20 text-emerald-400 rounded-xl"><Calendar className="w-6 h-6" /></div>
                        <h3 className="text-gray-400 font-bold text-sm uppercase">Média Diária (7D)</h3>
                    </div>
                    <p className="text-4xl font-black text-white relative z-10">
                        {chartData.length > 0 ? Math.round(chartData.reduce((acc, curr) => acc + curr.Inscritos, 0) / 7) : 0}
                    </p>
                </motion.div>
            </div>

            {/* Gráficos */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.5 }} className="lg:col-span-2 bg-gray-900 border border-gray-800 rounded-xl p-6 shadow-sm">
                    <h3 className="text-lg font-bold text-white mb-6 flex items-center gap-2"><Users className="w-5 h-5 text-purple-400" /> Crescimento de Inscritos (Últimos 7 dias)</h3>
                    <div className="h-[300px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                                <defs>
                                    <linearGradient id="colorInscritos" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.3}/>
                                        <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0}/>
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" stroke="#374151" vertical={false} />
                                <XAxis dataKey="name" stroke="#9ca3af" fontSize={12} tickLine={false} axisLine={false} />
                                <YAxis stroke="#9ca3af" fontSize={12} tickLine={false} axisLine={false} />
                                <Tooltip 
                                    contentStyle={{ backgroundColor: '#111827', border: '1px solid #374151', borderRadius: '0.5rem', color: '#fff' }}
                                    itemStyle={{ color: '#a78bfa' }}
                                />
                                <Area type="monotone" dataKey="Inscritos" stroke="#8b5cf6" strokeWidth={3} fillOpacity={1} fill="url(#colorInscritos)" />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </motion.div>

                <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.6 }} className="bg-gray-900 border border-gray-800 rounded-xl p-6 shadow-sm">
                    <h3 className="text-lg font-bold text-white mb-6 flex items-center gap-2"><MapPin className="w-5 h-5 text-blue-400" /> Top Cidades</h3>
                    <div className="h-[300px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={topCidades} layout="vertical" margin={{ top: 0, right: 0, left: 0, bottom: 0 }}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#374151" horizontal={false} />
                                <XAxis type="number" hide />
                                <YAxis dataKey="name" type="category" stroke="#9ca3af" fontSize={12} width={100} tickLine={false} axisLine={false} />
                                <Tooltip 
                                    cursor={{fill: '#1f2937'}}
                                    contentStyle={{ backgroundColor: '#111827', border: '1px solid #374151', borderRadius: '0.5rem', color: '#fff' }}
                                />
                                <Bar dataKey="value" fill="#3b82f6" radius={[0, 4, 4, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </motion.div>
            </div>
        </div>
    );
}
