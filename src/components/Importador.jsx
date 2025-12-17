import React, { useState } from 'react'
import Papa from 'papaparse'
import JSZip from 'jszip'
import { Upload, FileText, Check, RefreshCw } from 'lucide-react'

const Importador = ({ onDataLoaded }) => {
    const [dragActive, setDragActive] = useState(false)
    const [error, setError] = useState(null)
    const [loading, setLoading] = useState(false)

    const handleDrag = (e) => {
        e.preventDefault()
        e.stopPropagation()
        if (e.type === "dragenter" || e.type === "dragover") {
            setDragActive(true)
        } else if (e.type === "dragleave") {
            setDragActive(false)
        }
    }

    const processFile = async (file) => {
        setLoading(true)
        setError(null)

        try {
            if (file.name.endsWith('.zip')) {
                const zip = new JSZip()
                const zipContent = await zip.loadAsync(file)

                // Find the first CSV or TXT file in the zip
                const csvFile = Object.values(zipContent.files).find(f =>
                    !f.dir && (f.name.endsWith('.csv') || f.name.endsWith('.txt'))
                )

                if (csvFile) {
                    const content = await csvFile.async("string")
                    parseCSV(content)
                } else {
                    throw new Error("Nenhum arquivo CSV ou TXT encontrado dentro do ZIP.")
                }
            } else {
                // Assume text file
                parseCSV(file)
            }
        } catch (err) {
            setError("Erro ao processar arquivo: " + err.message)
            setLoading(false)
        }
    }

    const parseCSV = (fileOrContent) => {
        Papa.parse(fileOrContent, {
            header: true,
            skipEmptyLines: true,
            complete: (results) => {
                const rawData = results.data
                if (rawData.length === 0) {
                    setError("O arquivo parece vazio ou inválido.")
                    setLoading(false)
                    return
                }

                // Normalizar chaves para facilitar a busca (remove acentos e lowercase)
                const normalizeKey = (key) => key.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").trim();

                // Mapear cabeçalhos
                const headers = results.meta.fields || Object.keys(rows[0] || {});
                const headerMap = {};

                headers.forEach(h => {
                    const normalized = normalizeKey(h);
                    if (normalized.includes('nome')) headerMap.nome = h;
                    if (normalized.includes('tel') || normalized.includes('cel') || normalized.includes('whats')) headerMap.telefone = h;
                    if (normalized.includes('cpf') || normalized.includes('documento') || normalized.includes('rg')) headerMap.cpf = h;
                    if (normalized.includes('cidade') || normalized.includes('municipio') || normalized.includes('localidade')) headerMap.cidade = h;
                    if (normalized.includes('endereco') || normalized.includes('endereço') || normalized.includes('rua') || normalized.includes('logradouro') || normalized.includes('av')) headerMap.endereco = h;
                    if (normalized.includes('email') || normalized.includes('e-mail') || normalized.includes('correio')) headerMap.email = h;
                });

                const processedData = rawData.map((row, index) => {
                    // Tenta pega das colunas mapeadas
                    let nome = row[headerMap.nome];
                    let telefone = row[headerMap.telefone];
                    let cpf = row[headerMap.cpf];
                    let cidade = row[headerMap.cidade];
                    let endereco = row[headerMap.endereco];
                    let email = row[headerMap.email];

                    // Fallback: Procura nas chaves da linha se o map falhou (pode acontecer se o CSV for irregular)
                    if (!nome) nome = Object.values(row).find(v => v && v.length > 2); // Heurística: primeiro valor string > 2 chars

                    // Fallback para telefone se não achou no map
                    if (!telefone) {
                        const possivelTel = Object.values(row).find(v => {
                            const str = String(v).replace(/\D/g, '');
                            return str.length >= 8 && str.length <= 14;
                        });
                        if (possivelTel) telefone = possivelTel;
                    }

                    // Limpeza
                    if (telefone) telefone = telefone.toString().replace(/[^0-9]/g, '');

                    return {
                        id: index,
                        nome: nome ? nome.toString().trim() : '',
                        telefone: telefone || '',
                        cpf: cpf ? cpf.toString().replace(/[^0-9]/g, '') : '',
                        cidade: cidade ? cidade.toString().trim() : '',
                        endereco: endereco ? endereco.toString().trim() : '',
                        email: email ? email.toString().trim() : '',
                        detalhes: row // Salva tudo aqui para o JSONB
                    };
                }).filter(item => item.nome && item.nome.length > 1);

                // Deduplicação (Usando Mapa para garantir unicidade)
                const uniqueParticipants = new Map();
                const stats = {
                    totalImportado: rawData.length,
                    totalValido: 0,
                    duplicados: 0,
                    semNome: 0,
                    detalhes: []
                };

                processedData.forEach(p => {
                    // Chave única: CPF > Telefone > Nome
                    let uniqueKey = p.nome.toLowerCase();
                    if (p.cpf && p.cpf.length > 5) uniqueKey = p.cpf;
                    else if (p.telefone && p.telefone.length > 8) uniqueKey = p.telefone;

                    if (!uniqueParticipants.has(uniqueKey)) {
                        uniqueParticipants.set(uniqueKey, p);
                    } else {
                        stats.duplicados++;
                        stats.detalhes.push({ nome: p.nome, motivo: 'Duplicado', chave: uniqueKey });
                    }
                });

                const cleanedData = Array.from(uniqueParticipants.values());
                stats.totalValido = cleanedData.length;
                stats.semNome = rawData.length - processedData.length;

                onDataLoaded(cleanedData, stats)
                setLoading(false)
            },
            error: (err) => {
                setError("Erro ao ler CSV: " + err.message)
                setLoading(false)
            }
        })
    }

    const handleDrop = (e) => {
        e.preventDefault()
        e.stopPropagation()
        setDragActive(false)
        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            processFile(e.dataTransfer.files[0])
        }
    }

    const handleChange = (e) => {
        e.preventDefault()
        if (e.target.files && e.target.files[0]) {
            processFile(e.target.files[0])
        }
    }

    return (
        <div
            className={`p-10 border-2 border-dashed rounded-xl text-center transition-all cursor-pointer relative group
            ${dragActive ? 'border-primary bg-primary/10' : 'border-gray-700 hover:border-primary hover:bg-gray-800/50'}
        `}
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
        >
            <input
                type="file"
                id="file-upload"
                className="hidden"
                accept=".csv,.txt,.zip"
                onChange={handleChange}
            />

            <label htmlFor="file-upload" className="cursor-pointer block h-full w-full">
                <div className="flex flex-col items-center gap-4">
                    <div className={`p-4 rounded-full bg-gray-800 group-hover:bg-gray-700 transition-colors ${loading ? 'animate-pulse' : ''}`}>
                        {loading ? <RefreshCw className="w-8 h-8 text-primary animate-spin" /> : <Upload className="w-8 h-8 text-primary" />}
                    </div>
                    <div>
                        <h3 className="text-xl font-bold text-white mb-2">Importar Lista (CSV ou ZIP)</h3>
                        <p className="text-gray-400">Arraste seu arquivo do Google Forms aqui</p>
                        <p className="text-xs text-gray-500 mt-2">Aceita .csv, .txt e .zip direto do Google</p>
                    </div>
                </div>
            </label>

            {error && (
                <div className="absolute bottom-4 left-0 right-0 text-red-400 text-sm bg-red-900/20 py-1 mx-4 rounded">
                    {error}
                </div>
            )}
        </div>
    )
}

export default Importador
