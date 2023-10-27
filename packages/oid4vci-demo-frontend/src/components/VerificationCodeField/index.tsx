import React, {ChangeEvent, useEffect, useRef, useState} from 'react'
import style from '../VerificationCodeField/index.module.css'

interface Props {
    length: number
    onComplete: (value: string) => void
}

enum Key {
    BACKSPACE = 'Backspace',
}

const VerificationCodeField: React.FC<Props> = ({length, onComplete}) => {
    const [values, setValues] = useState<string[]>(Array(length).fill(''))
    const inputRefs = useRef<(HTMLInputElement | null)[]>([])

    useEffect(() => {
        if (inputRefs.current[0]) {
            setTimeout(() => { // Without delay focus will not work
                inputRefs.current[0]?.focus()
            }, 100)
        }
    }, [])

    const handleUpdate = (index: number, value: string) => {
        const updatedValues = [...values]
        updatedValues[index] = value
        setValues(updatedValues)

        // Focus next input if possible
        if (value !== '') {
            inputRefs?.current[index + 1]?.focus()
        }

        const isComplete = updatedValues.every((val) => val !== '')
        if (isComplete) {
            const newValue = updatedValues.join('')
            onComplete(newValue)
        }
    }

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>, index: number) => {
        if (e.key === Key.BACKSPACE && values[index] === '' && index > 0) {
            // Focus the previous input and clear its value
            const updatedValues = [...values]
            updatedValues[index - 1] = ''
            setValues(updatedValues)
            inputRefs?.current[index - 1]?.focus()
        }
    }

    const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>, index: number) => {
        e.preventDefault()
        const pastedData = e.clipboardData.getData('text')
        const numbersFromClipboard = pastedData.replace(/[^0-9]/g, '')
        let updatedValues = [...values]

        for (let i = 0; i < numbersFromClipboard.length && index + i < length; i++) {
            updatedValues[index + i] = numbersFromClipboard[i]
        }

        setValues(updatedValues)
    }

    return (
        <div className={style.container}>
            {values.map((value, index) => (
                <input
                    ref={(el) => (inputRefs.current[index] = el)}
                    className={style.digitField}
                    key={index}
                    type="text"
                    value={value}
                    onChange={(e: ChangeEvent<HTMLInputElement>) => handleUpdate(index, e.target.value)}
                    onKeyDown={(e: React.KeyboardEvent<HTMLInputElement>) => handleKeyDown(e, index)}
                    onPaste={(e) => handlePaste(e, index)}
                    onInput={(e: React.FormEvent<HTMLInputElement>) => {
                        e.currentTarget.value = e.currentTarget.value.replace(/[^0-9]/g, '')
                    }}
                    maxLength={1}
                />
            ))}
        </div>
    )
}

export default VerificationCodeField
