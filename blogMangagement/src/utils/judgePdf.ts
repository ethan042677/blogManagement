import { type FileData } from "./interface"


const IMAGE_FORMATS = new Set(['jpg', 'jpeg', 'png', 'webp', 'avif'])

export const isPdf = (file: FileData) => {
    const mimeType = file.mimeType?.toLowerCase()
    if (mimeType) return mimeType === 'application/pdf'
    return file.format?.toLowerCase() === 'pdf'
}

export const isImage = (file: FileData) => {
    const mimeType = file.mimeType?.toLowerCase()
    if (mimeType) return mimeType.startsWith('image/')
    return IMAGE_FORMATS.has(file.format?.toLowerCase())
}