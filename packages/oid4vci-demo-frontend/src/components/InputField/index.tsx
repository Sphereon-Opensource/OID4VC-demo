import React, {ChangeEvent, CSSProperties, FC, FocusEvent, HTMLInputTypeAttribute, ReactElement, useEffect, useState} from 'react'
import style from './index.module.css'
import {FormFieldValue} from '../../types'

type InputValue = string | number | ReadonlyArray<string> | undefined

type Props = {
    labelStyle?: CSSProperties
    inlineStyle?: CSSProperties
    type: HTMLInputTypeAttribute
    label?: string
    defaultValue?: FormFieldValue
    placeholder?: string
    readonly?: boolean
    customValidation?: RegExp
    onChange?: (value: FormFieldValue) => Promise<void>
}

const InputField: FC<Props> = (props: Props): ReactElement => {
    const {
        labelStyle,
        inlineStyle,
        readonly = false,
        defaultValue,
        placeholder,
        label,
        onChange,
        type,
        customValidation
    } = props
    const [value, setValue] = useState<FormFieldValue>(defaultValue)
    const [isValid, setIsValid] = useState<boolean>(true)
    const isCheckBox = type === 'checkbox'

    useEffect(() => { // It can be that the form is rendered without payload data the first time
        setValue(defaultValue);
    }, [defaultValue]);

    const onChangeValue = async (event: ChangeEvent<HTMLInputElement>): Promise<void> => {
        const value: string | boolean = isCheckBox ? event.target.checked : event.target.value
        setValue(value)

        if (onChange) {
            await onChange(value)
        }
    }

    const onBlur = async (event: FocusEvent<HTMLInputElement>): Promise<void> => {
        if (customValidation) {
            const value: string | boolean = isCheckBox ? event.target.checked : event.target.value
            setIsValid(customValidation.test(value.toString()))
        }
    }

    return <div style={{ ...(inlineStyle ?? {})}} className={style.container}>
        { label &&
            <label style={labelStyle} className="poppins-normal-10 inputFieldLabel">
                {label}
            </label>
        }
        <input
            type={type}
            style={{...inlineStyle, ...(!isValid && { borderColor: 'red' })}}
            placeholder={placeholder}
            readOnly={readonly}
            tabIndex={readonly ? -1 : undefined} // Do not tab-stop in read-only fields
            onChange={onChangeValue}
            onBlur={onBlur}
            className={`${style.inputField}${!readonly ? ` ${style.enabled}` : ''}`}
            {...(!isCheckBox && { defaultValue: defaultValue as InputValue })}
            {...(!isCheckBox && { value: value as InputValue})}
            {...(isCheckBox && { checked: value as boolean})}
        />
    </div>
}

export default InputField
