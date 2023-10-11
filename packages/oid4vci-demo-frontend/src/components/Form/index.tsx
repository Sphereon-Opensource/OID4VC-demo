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
    const { form, onChange } = props
    const {t} = useTranslation()
    const [formData, setFormData] = useState<FormData>(getInitialState(form))

    const onChangeValue = async (value: FormFieldValue, key: string): Promise<void> => {
        const data = {...formData, [key]: value}
        setFormData(data)
        if (onChange) {
            await onChange(data)
        }
    }

    const getFormFields = (): Array<ReactElement> => {
        return form.map((row: DataFormRow) =>
                <div className={style.formContentContainer}>
                    {row.map((field: DataFormElement): ReactNode => {
                        const defaultValue: FormFieldValue = evaluateDefaultValue(field, formData)
                        switch (field.type) {
                            case 'checkbox':
                                return <SSICheckbox
                                    borderColor={'#202776'}
                                    selectedColor={'#202776'}
                                    label={field.labelUrl ?
                                        <div style={{display: 'flex', flexDirection: 'row', gap: 4}}>
                                            {field.label &&
                                                <div className={"poppins-normal-16"}>{t(field.label)}</div>
                                            }
                                            {field.labelUrl.text &&
                                                <div className={"poppins-normal-16"} style={{color: '#4E51A7', textDecoration: 'underline'}} onClick={() => window.open('https://www.google.com', '_blank')}>{t(field.labelUrl.text)}</div>
                                            }
                                        </div> : field.label ? t(field.label) : undefined
                                    }
                                    disabled={field.readonly}
                                    labelColor={'#424242'}
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
                    })}
                </div>
        )
    }

    return <div className={style.container}>
        {getFormFields()}
    </div>
}

export default Form;
