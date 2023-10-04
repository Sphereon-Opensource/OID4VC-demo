import fs from "fs";

export function loadJsonFiles<T>({path}: { path: string }): {
    names: string[],
    fileNames: string[],
    asObject: Record<string, T>
    asArray: T[]

} {
    const fileNames = fs.readdirSync(path).filter(file => file.match(/\.json$/))
    const names: string[] = []
    const files: string[] = []
    const asObject: Record<string, T> = {}
    const asArray: T[] = []

    fileNames.forEach((fileName: string) => {
        let typeName = fileName.match(/(^.*?)\.json/)
        if (typeName) {
            const name = typeName[1]
            names.push(name)
            files.push(fileName)
            const jsonFilePath = `${path}/${fileName}`
            try {
                const object = JSON.parse(fs.readFileSync(jsonFilePath, 'utf8').toString()) as T
                asObject[name] = object
                asArray.push(object)
            } catch (e) {
                if (e instanceof Error) {
                    throw new Error(`An error occurred while reading JSON config file ${jsonFilePath}: ${e.message}`)
                }
                throw e
            }
        }
    })
    return {names, fileNames: files, asObject, asArray}
}

/**
 * The function builds a file path without missing or excess slashes
 * @param segments
 */
export function normalizeFilePath(...segments: (string | null | undefined)[]): string {
    let result = '';

    for (let i = 0; i < segments.length; i++) {
        const segment = segments[i];

        if (segment !== null && segment !== undefined && segment !== '') {
            if (i === 0) {
                // For the first non-null and non-empty segment, remove the trailing slash if it exists
                result += segment.replace(/\/$/, '');
            } else {
                // For subsequent segments, ensure all slashes are present
                result += `/${segment.replace(/^\//, '').replace(/\/$/, '')}`;
            }
        }
    }
    return result;
}
