import {FilterItem} from "../ecosystem/ecosystem-config";

export interface JsonDataItem {
    [key: string]: any
}

export interface ComboboxItem {
    value: string
    caption: string
}

// Helper function to get nested property value from an object using a path
const getNestedValue = (obj: any, path: string): any => {
    if (!path || !obj) {
        return undefined
    }

    // Remove leading slash and split by slash
    const keys = path.replace(/^\//, '').split('/')

    let current = obj
    for (const key of keys) {
        if (current === null || current === undefined) {
            return undefined
        }
        current = current[key]
    }

    return current
}

export const loadJsonData = async (jsonFile: string): Promise<JsonDataItem[]> => {
    try {
        // In a real implementation, you'd fetch this from your data source
        // For now, assuming the JSON is available as a module or API endpoint
        const response = await import(`../data/${jsonFile}`)
        return response.default || response
    } catch (error) {
        console.error(`Failed to load JSON file: ${jsonFile}`, error)
        return []
    }
}

export const extractComboboxItems = (
    data: JsonDataItem[],
    valuePath: string,
    captionPath?: string,
    filters?: FilterItem[]
): ComboboxItem[] => {
    let filteredData = data

    // Apply filters with AND logic if specified
    if (filters && filters.length > 0) {
        filteredData = data.filter(item => {
            // All filters must match (AND logic)
            return filters.every(filter => {
                const itemValue = getNestedValue(item, filter.filterKey)
                return itemValue?.toString() === filter.filterValue
            })
        })
    }

    // Extract unique items using nested paths
    const captionPathToUse = captionPath ?? valuePath
    const uniqueItems = new Map<string, string>()

    filteredData.forEach(item => {
        const value = getNestedValue(item, valuePath)?.toString() || ''
        const caption = getNestedValue(item, captionPathToUse)?.toString() || ''

        if (value && !uniqueItems.has(value)) {
            uniqueItems.set(value, caption)
        }
    })

    return Array.from(uniqueItems.entries()).map(([value, caption]) => ({
        value,
        caption
    }))
}

// New function to extract form defaults
export const extractFormDefaults = (
    data: JsonDataItem[],
    filters?: FilterItem[]
): JsonDataItem | undefined => {
    let filteredData = data

    // Apply filters with AND logic if specified
    if (filters && filters.length > 0) {
        filteredData = data.filter(item => {
            // All filters must match (AND logic)
            return filters.every(filter => {
                const itemValue = getNestedValue(item, filter.filterKey)
                return itemValue?.toString() === filter.filterValue
            })
        })
    }

    // Return the first matching item (or undefined if no match)
    if(filteredData.length == 0) {
        throw Error('The filter in extractFormDefaults not not find any matches')
    }
    return filteredData[0]
}