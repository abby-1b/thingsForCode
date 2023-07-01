
const fileNames: string[] = []
const fileStorage: Record<number, string> = {}

export function storeFile(code: string, index: number): number {
    fileStorage[index] = code
    return index
}

export function getFile(index: number): string {
    if (index in fileStorage) {
        return fileStorage[index]
    }

    throw "TODO: implement file fetching"
}

export function storeName(name: string): number {
    fileNames.push(name)
    return fileNames.length - 1
}

export function getName(index: number) {
    return fileNames[index]
}

export function fileNameExists(name: string) {
    return fileNames.includes(name)
}

export function getNameIndex(name: string) {
    return fileNames.indexOf(name)
}
