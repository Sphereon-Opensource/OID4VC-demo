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
            const object = JSON.parse(fs.readFileSync(`${path}/${fileName}`, 'utf8').toString()) as T
            asObject[name] = object
            asArray.push(object)
        }
    })
    return {names, fileNames: files, asObject, asArray}
}
