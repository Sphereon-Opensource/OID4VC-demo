import React, {FC, ReactElement, ReactNode, useEffect, useRef, useState} from 'react'
import {SSICheckbox} from '@sphereon/ui-components.ssi-react'
import {useTranslation} from 'react-i18next'
import {DataFormElement, DataFormRow, FilterItem} from '../../ecosystem/ecosystem-config'
import {generateRandomIBAN} from '../../utils/iban'
import {transformFormConfigToEmptyObject} from '../../utils/ObjectUtils'
import InputField from '../InputField'
import {FormFieldValue, FormOutputData, ImmutableRecord} from '../../types'
import style from './index.module.css'
import {extractComboboxItems, extractFormDefaults, JsonDataItem, loadJsonData} from '../../utils/jsonLoader'
import {Text} from "../Text";

type Props = {
    inputBackgroundColor?: string
    formConfig: DataFormRow[]
    formInitData?: ImmutableRecord
    formDefaultsFromJson?: {
        jsonFile: string
        value: string
        caption?: string
        filters?: FilterItem[]
    }
    onChange?: (formData: FormOutputData) => Promise<void>
}

interface ComboboxData {
    [fieldKey: string]: Array<{ value: string, caption: string }>
}

function getInitialState(form: DataFormRow[]): FormOutputData {
    return transformFormConfigToEmptyObject(form)
}

// Helper function to resolve filter values with placeholders
const resolveFilters = (filters: FilterItem[], formData: FormOutputData): FilterItem[] => {
    return filters
        .filter(filter => filter?.filterKey && filter?.filterValue)
        .map(filter => ({
            ...filter,
            filterValue: filter.filterValue.startsWith('${') && filter.filterValue.endsWith('}')
                ? formData[filter.filterValue.slice(2, -1)]?.toString() || ''
                : filter.filterValue
        }))
}

const evaluateDefaultValue = (
    field: DataFormElement,
    formInitData: ImmutableRecord | undefined,
    formData: FormOutputData,
    jsonDefaults?: JsonDataItem
): FormFieldValue => {
    const fieldValue = field.key && formData[field.key]
    if (fieldValue) {
        return fieldValue
    }

    let defaultValue: FormFieldValue = formInitData?.[field.key] ?? field.defaultValue ?? ''

    // Check if we have JSON defaults for this field
    if (jsonDefaults && jsonDefaults[field.key] !== undefined) {
        defaultValue = jsonDefaults[field.key]
    }

    if (defaultValue === '*RANDOM8') {
        defaultValue = Math.floor(Math.random() * 89999999 + 10000000)
    } else if (defaultValue === '*RANDOM-IBAN') { // TODO this is for a demo, create something more sophisticated later
        defaultValue = generateRandomIBAN()
    }

    formData[field.key] = `${defaultValue}`
    return defaultValue
}

const Form: FC<Props> = (props: Props): ReactElement => {
    const {formConfig, formInitData, formDefaultsFromJson, onChange} = props
    const {t} = useTranslation()
    const [formData, setFormData] = useState<FormOutputData>(getInitialState(formConfig))
    const [comboboxData, setComboboxData] = useState<ComboboxData>({})
    const [loadingCombobox, setLoadingCombobox] = useState<{ [key: string]: boolean }>({})
    const [jsonDefaults, setJsonDefaults] = useState<JsonDataItem | undefined>()
    const [defaultsLoaded, setDefaultsLoaded] = useState<boolean>(false)
    const fileInputRefs = useRef<{ [key: string]: HTMLInputElement | null }>({})

    const onChangeValue = async (value: FormFieldValue, key: string): Promise<void> => {
        const data = {...formData, [key]: value}
        setFormData(data)

        // Check if this change affects any dependent comboboxes
        await updateDependentComboboxes(key, value, data)

        // Check if this change affects the form defaults
        if (formDefaultsFromJson) {
            await loadFormDefaults(data)
        }

        if (onChange) {
            await onChange(data)
        }
    }

    const loadFormDefaults = async (currentFormData: FormOutputData): Promise<void> => {
        if (!formDefaultsFromJson) {
            return
        }

        try {
            const jsonData = await loadJsonData(formDefaultsFromJson.jsonFile)

            // Resolve filter values with current form data
            const resolvedFilters = formDefaultsFromJson.filters
                ? resolveFilters(formDefaultsFromJson.filters, currentFormData)
                : undefined

            const defaults = extractFormDefaults(jsonData, resolvedFilters)
            setJsonDefaults(defaults)

            // Update form data with defaults (but don't overwrite existing values)
            if (defaults) {
                const updatedFormData = {...currentFormData}
                let hasChanges = false

                Object.keys(defaults).forEach(key => {
                    if (!updatedFormData[key] || updatedFormData[key] === '') {
                        updatedFormData[key] = defaults[key]?.toString() || ''
                        hasChanges = true
                    }
                })

                if (hasChanges) {
                    setFormData(updatedFormData)
                    if (onChange) {
                        await onChange(updatedFormData)
                    }
                }
            }
        } catch (error) {
            console.error('Failed to load form defaults:', error)
        }
    }

    const updateDependentComboboxes = async (changedKey: string, changedValue: FormFieldValue, currentFormData: FormOutputData): Promise<void> => {
        // Find all combobox fields that depend on the changed field
        const allFields = formConfig.flat()
        const dependentFields = allFields.filter(field =>
            field.type === 'combobox' &&
            field.itemsFromJson?.filters?.some(filter =>
                filter.filterKey?.replace('/', '') === changedKey
            )
        )

        for (const field of dependentFields) {
            if (field.itemsFromJson) {
                await loadComboboxData(field, currentFormData)
            }
        }
    }

    const loadComboboxData = async (field: DataFormElement, currentFormData?: FormOutputData): Promise<void> => {
        if (!field.itemsFromJson) {
            return
        }

        const {jsonFile, value, caption, filters} = field.itemsFromJson

        setLoadingCombobox(prev => ({...prev, [field.key]: true}))

        try {
            const jsonData = await loadJsonData(jsonFile)

            // Resolve filter values with current form data
            const resolvedFilters = filters && currentFormData
                ? resolveFilters(filters, currentFormData)
                : undefined

            const items = extractComboboxItems(
                jsonData,
                value,
                caption,
                resolvedFilters
            )

            setComboboxData(prev => ({
                ...prev,
                [field.key]: items
            }))
        } catch (error) {
            console.error(`Failed to load combobox data for field ${field.key}:`, error)
            setComboboxData(prev => ({
                ...prev,
                [field.key]: []
            }))
        } finally {
            setLoadingCombobox(prev => ({...prev, [field.key]: false}))
        }
    }

    const handleFileUpload = async (file: File, fieldKey: string): Promise<void> => {
        if (file.type.startsWith('image/')) {
            const reader = new FileReader()
            reader.onload = async (e) => {
                const base64 = e.target?.result as string
                await onChangeValue(base64, fieldKey)
            }
            reader.readAsDataURL(file)
        }
    }

    const handleFileDrop = (e: React.DragEvent<HTMLDivElement>, fieldKey: string): void => {
        e.preventDefault()
        const files = Array.from(e.dataTransfer.files)
        if (files.length > 0) {
            handleFileUpload(files[0], fieldKey)
        }
    }

    const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>, fieldKey: string): void => {
        const files = e.target.files
        if (files && files.length > 0) {
            handleFileUpload(files[0], fieldKey)
        }
    }

    const deleteImage = async (fieldKey: string): Promise<void> => {
        await onChangeValue('', fieldKey)
        // Reset file input
        if (fileInputRefs.current[fieldKey]) {
            fileInputRefs.current[fieldKey]!.value = ''
        }
    }

    const convertBase64 = (urlSafeBase64: string): string => {
        console.log('getDisplayImageUrl IN', urlSafeBase64)
        if (!urlSafeBase64 || !urlSafeBase64.startsWith('data:')) {
            return urlSafeBase64 // not a base64 input
        }

        // Convert URL-safe base64 back to standard base64
        let base64 = urlSafeBase64
            .replace(/-/g, '+')
            .replace(/_/g, '/')

        // Add padding if needed
        const padding = base64.length % 4
        if (padding) {
            base64 += '='.repeat(3 - padding)
        }

        // Add data URL prefix (assuming JPEG, adjust as needed)
        console.log('getDisplayImageUrl OUT', base64)
        return `${base64}`
    }

    const getFieldElementFrom = (field: DataFormElement): ReactElement => {
        const defaultValue: FormFieldValue = evaluateDefaultValue(field, formInitData, formData, jsonDefaults)

        switch (field.type) {
            case 'checkbox':
                return <SSICheckbox
                    borderColor={field.display?.checkboxBorderColor}
                    selectedColor={field.display?.checkboxSelectedColor}
                    // @ts-ignore // FIXME __html complaining
                    label={field.labelUrl ? <div dangerouslySetInnerHTML={{__html: t(field.label, {url: field.labelUrl})}}/> : field.label}
                    disabled={field.readonly || formInitData?.[field.id] !== undefined}
                    labelColor={field.display?.checkboxLabelColor}
                    onValueChange={async (value: FormFieldValue): Promise<void> => onChangeValue(value, field.key)}
                />

            case 'combobox':
                const items = comboboxData[field.key] || []
                const isLoading = loadingCombobox[field.key]
                const isComboReadonly = field.readonly || formInitData?.[field.key] !== undefined || Boolean(field.readonlyWhenAbsentInPayload)

                return <div style={{width: '100%', ...field.inputStyle}}>
                    {field.label && (
                        <label
                            htmlFor={field.id}
                            style={field.labelStyle}
                        >
                            {t(field.label)}
                        </label>
                    )}
                    <select
                        id={field.id}
                        disabled={isComboReadonly || isLoading}
                        value={defaultValue?.toString() || ''}
                        onChange={(e) => onChangeValue(e.target.value, field.key)}
                        style={{
                            width: '100%',
                            padding: '8px',
                            border: '1px solid #ccc',
                            borderRadius: '4px',
                            backgroundColor: isComboReadonly && props.inputBackgroundColor ? props.inputBackgroundColor : undefined,
                            ...field.inputStyle
                        }}
                    >
                        <option value="">{isLoading ? 'Loading...' : 'Select...'}</option>
                        {items.map((item, index) => (
                            <option key={index} value={item.value}>
                                {item.caption}
                            </option>
                        ))}
                    </select>
                </div>
            case 'profileImage':
                const imageValue = defaultValue?.toString() || ''
                const isImageReadonly = field.readonly || formInitData?.[field.key] !== undefined

                return <div style={{width: '100%', ...field.inputStyle}}>
                    {field.label && (
                        <label style={field.labelStyle}>
                            {t(field.label)}
                        </label>
                    )}
                    <div style={{
                        border: '2px dashed #ccc',
                        borderRadius: '8px',
                        padding: '16px',
                        textAlign: 'center',
                        backgroundColor: isImageReadonly && props.inputBackgroundColor ? props.inputBackgroundColor : '#fafafa',
                        position: 'relative'
                    }}
                         onDrop={(e) => !isImageReadonly && handleFileDrop(e, field.key)}
                         onDragOver={(e) => e.preventDefault()}
                         onDragEnter={(e) => e.preventDefault()}
                    >
                        {imageValue ? (
                            <div style={{position: 'relative'}}>
                                <img
                                    src={imageValue}
                                    alt="Profile"
                                    style={{
                                        maxWidth: '200px',
                                        maxHeight: '200px',
                                        borderRadius: '8px',
                                        objectFit: 'cover'
                                    }}
                                />
                                {!isImageReadonly && (
                                    <button
                                        type="button"
                                        onClick={() => deleteImage(field.key)}
                                        style={{
                                            position: 'absolute',
                                            top: '8px',
                                            right: '8px',
                                            backgroundColor: 'rgba(255, 255, 255, 0.8)',
                                            border: 'none',
                                            borderRadius: '50%',
                                            width: '24px',
                                            height: '24px',
                                            cursor: 'pointer',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            fontSize: '14px'
                                        }}
                                        title="Delete image"
                                    >
                                        ×
                                    </button>
                                )}
                            </div>
                        ) : (
                            <div>
                                <div style={{marginBottom: '12px', color: '#666'}}>
                                    Drop an image here or click to upload
                                </div>
                                {!isImageReadonly && (
                                    <button
                                        type="button"
                                        onClick={() => fileInputRefs.current[field.key]?.click()}
                                        style={{
                                            backgroundColor: '#007bff',
                                            color: 'white',
                                            border: 'none',
                                            padding: '8px 16px',
                                            borderRadius: '4px',
                                            cursor: 'pointer'
                                        }}
                                    >
                                        Choose Image
                                    </button>
                                )}
                            </div>
                        )}
                        {!isImageReadonly && (
                            <input
                                type="file"
                                ref={(el) => fileInputRefs.current[field.key] = el}
                                style={{display: 'none'}}
                                accept="image/*"
                                onChange={(e) => handleFileInputChange(e, field.key)}
                            />
                        )}
                    </div>
                </div>
            case 'header':
                return <h4 style={{margin: 0}}>{field.label}{defaultValue && `: ${defaultValue}`}</h4>
            case 'text-area':
                return <Text
                    title={[field.label ?? '']}
                    lines={[`${defaultValue}`]}
                    h2Style={{fontSize: '0.8em', fontWeight: 'bold', margin: '0 0 4px 0'}}
                    pStyle={{fontSize: '0.9em', margin: 0}}
                />

            case 'text':
            case 'date':
                const isReadonly = field.readonly || formInitData?.[field.key] !== undefined || Boolean(field.readonlyWhenAbsentInPayload)
                const isEditable = field.editable !== false // Default to true if not specified

                return <InputField
                    id={field.id}
                    labelStyle={field.labelStyle}
                    inlineStyle={{width: '100%', ...(isReadonly && !!props.inputBackgroundColor && {backgroundColor: props.inputBackgroundColor}), ...field.inputStyle}}
                    label={field.label ? t(field.label) ?? undefined : undefined}
                    type={field.type}
                    readonly={isReadonly}
                    editable={isEditable}
                    defaultValue={defaultValue}
                    customValidation={field.customValidation ? new RegExp(field.customValidation) : undefined}
                    onChange={async (value: FormFieldValue): Promise<void> => onChangeValue(value, field.key)}
                    options={field.options}
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
        return formConfig.map((row: DataFormRow) => getRowElementFrom(row))
    }

    useEffect((): void => {
        // Load initial combobox data for fields without dependencies
        const allFields = formConfig.flat()
        const comboboxFields = allFields.filter(field =>
            field.type === 'combobox' && field.itemsFromJson
        )

        comboboxFields.forEach(field => {
            if (!field.itemsFromJson?.filters || field.itemsFromJson.filters.length === 0) {
                // Load data for non-dependent comboboxes
                loadComboboxData(field)
            }
        })

        // Load initial form defaults
        if (formDefaultsFromJson) {
            loadFormDefaults(formData)
        }

        setDefaultsLoaded(true)
    }, [formConfig])

    useEffect((): void => {
        if (onChange && formInitData) {
            onChange(formData)
        }
    })

    return <div className={style.container}>
        {getFormFrom()}
    </div>
}

export default Form;
