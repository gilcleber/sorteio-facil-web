import React, { useRef, useState } from 'react'

const PinInput = ({ value, onChange, disabled = false }) => {
    const [pins, setPins] = useState(['', '', '', ''])
    const inputRefs = [useRef(null), useRef(null), useRef(null), useRef(null)]

    const handleChange = (index, val) => {
        // Aceita apenas números
        if (val && !/^\d$/.test(val)) return

        const newPins = [...pins]
        newPins[index] = val

        setPins(newPins)
        onChange(newPins.join(''))

        // Auto-focus no próximo campo
        if (val && index < 3) {
            inputRefs[index + 1].current?.focus()
        }
    }

    const handleKeyDown = (index, e) => {
        // Backspace: volta para o campo anterior
        if (e.key === 'Backspace' && !pins[index] && index > 0) {
            inputRefs[index - 1].current?.focus()
        }

        // Setas: navega entre campos
        if (e.key === 'ArrowLeft' && index > 0) {
            inputRefs[index - 1].current?.focus()
        }
        if (e.key === 'ArrowRight' && index < 3) {
            inputRefs[index + 1].current?.focus()
        }
    }

    const handlePaste = (e) => {
        e.preventDefault()
        const pastedData = e.clipboardData.getData('text').slice(0, 4)

        if (/^\d{4}$/.test(pastedData)) {
            const newPins = pastedData.split('')
            setPins(newPins)
            onChange(pastedData)
            inputRefs[3].current?.focus()
        }
    }

    return (
        <div className="flex gap-3 justify-center">
            {pins.map((pin, index) => (
                <input
                    key={index}
                    ref={inputRefs[index]}
                    type="text"
                    inputMode="numeric"
                    maxLength={1}
                    value={pin}
                    onChange={(e) => handleChange(index, e.target.value)}
                    onKeyDown={(e) => handleKeyDown(index, e)}
                    onPaste={index === 0 ? handlePaste : undefined}
                    disabled={disabled}
                    className="w-14 h-16 text-center text-2xl font-bold bg-gray-800 border-2 border-gray-700 rounded-xl focus:border-purple-500 focus:outline-none transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    autoComplete="off"
                />
            ))}
        </div>
    )
}

export default PinInput
