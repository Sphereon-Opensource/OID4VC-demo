import React, {FC, ReactElement, ReactNode, useState} from 'react';
import {SSICheckbox} from '@sphereon/ui-components.ssi-react';
import {useTranslation} from 'react-i18next';
import {DataFormElement, DataFormRow} from '../../ecosystem-config';
import {generateRandomIBAN} from '../../utils/iban';
import {transformFormConfigToEmptyObject} from '../../utils/ObjectUtils';
import InputField from '../InputField';
import {FormData, FormFieldValue} from '../../types';
import style from './index.module.css';

type Props = {
    form: DataFormRow[]
    onChange?: (formData: FormData) => Promise<void>
}

function getInitialState(form: DataFormRow[] | undefined): FormData {
    if (!form) {
        return {
            firstName: '',
            lastName: '',
            emailAddress: ''
        }
    }
    return transformFormConfigToEmptyObject(form)
}

const evaluateDefaultValue = (field: DataFormElement, payload: FormData): FormFieldValue => {
    const payloadValue = payload[field.key]
    if (payloadValue) {
        return payloadValue
    }

    let defaultValue: FormFieldValue = field.defaultValue ?? ''
    if (defaultValue === '*RANDOM8') { // TODO this is for a demo, create something more sophisticated later
        defaultValue = Math.floor(Math.random() * 89999999 + 10000000)
    } else if (defaultValue === '*RANDOM-IBAN') { // TODO this is for a demo, create something more sophisticated later
        defaultValue = generateRandomIBAN()
    }
    payload[field.key] = `${defaultValue}`
    return defaultValue
}

const Form: FC<Props> = (props: Props): ReactElement => {
    const {form, onChange} = props
    const {t} = useTranslation()
    const [formData, setFormData] = useState<FormData>(getInitialState(form))

    const onChangeValue = async (value: FormFieldValue, key: string): Promise<void> => {
        const data = {...formData, [key]: value}
        setFormData(data)
        if (onChange) {
            await onChange(data)
        }
    }

    const getFieldElementFrom = (field: DataFormElement): ReactElement => {
        const defaultValue: FormFieldValue = evaluateDefaultValue(field, formData)
        switch (field.type) {
            case 'checkbox':
                return <SSICheckbox
                    borderColor={field.display?.checkboxBorderColor}
                    selectedColor={field.display?.checkboxSelectedColor}
                    // @ts-ignore // FIXME __html complaining
                    label={field.labelUrl ? <div dangerouslySetInnerHTML={{ __html: t(field.label, { url: field.labelUrl })}}/> : field.label}
                    disabled={field.readonly}
                    labelColor={field.display?.checkboxLabelColor}
                    onValueChange={async (value: FormFieldValue): Promise<void> => onChangeValue(value, field.key)}
                />
            case 'text':
            case 'date':
                return <InputField
                    label={field.label ? t(field.label) ?? undefined : undefined}
                    type={field.type}
                    readonly={field.readonly}
                    defaultValue={defaultValue}
                    customValidation={field.customValidation ? new RegExp(field.customValidation) : undefined}
                    onChange={async (value: FormFieldValue): Promise<void> => onChangeValue(value, field.key)}
                />
            default:
                return <div/>
        }
    }

    const getRowElementFrom = (row: DataFormRow): ReactElement => {
        return <div className={style.formRowContainer}>
            {row.map((field: DataFormElement): ReactNode => getFieldElementFrom(field))}
        </div>
    }

    const getFormFrom = (): Array<ReactElement> => {
        return form.map((row: DataFormRow) => getRowElementFrom(row))
    }

    return <div className={style.container}>
        {getFormFrom()}
    </div>
}

export default Form;
