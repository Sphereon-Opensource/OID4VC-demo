import React, {ChangeEvent, FC, HTMLInputTypeAttribute, ReactElement, useState, FocusEvent} from 'react';
import style from './index.module.css';
import {FormFieldValue} from '../../types';

type Props = {
    type: HTMLInputTypeAttribute;
    label?: string
    defaultValue?: FormFieldValue
    placeholder?: string
    readonly?: boolean
    customValidation?: RegExp
    onChange?: (value: FormFieldValue) => Promise<void>
}

const InputField: FC<Props> = (props: Props): ReactElement => {
    const {
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

    const onChangeValue = async (event: ChangeEvent<HTMLInputElement>): Promise<void> => {
        const value: string | boolean = type === 'checkbox' ? event.target.checked : event.target.value
        setValue(value)

        if (onChange) {
            await onChange(value)
        }
    }

    const onBlur = async (event: FocusEvent<HTMLInputElement>): Promise<void> => {
        if (customValidation) {
            const value: string | boolean = type === 'checkbox' ? event.target.checked : event.target.value
            setIsValid(customValidation.test(value.toString()))
        }
    }

    return <div className={style.container}>
        { label &&
            <label className="poppins-normal-10">
                {label}
            </label>
        }
        <input
            type={type}
            style={{ ...(!isValid && { borderColor: 'red' }) }}
            placeholder={placeholder}
            readOnly={readonly}
            onChange={onChangeValue}
            onBlur={onBlur}
            {...(!readonly && { className: style.enabled })}
            {...(!isCheckBox && { defaultValue: defaultValue as string | number | ReadonlyArray<string> | undefined })}
            {...(!isCheckBox && { value: value as string | number | ReadonlyArray<string> | undefined})}
            {...(isCheckBox && { checked: value as boolean})}
        />
    </div>
}

export default InputField
