import React, { FC, useState, useCallback } from 'react'
import Cropper from 'react-easy-crop'
import { Area } from 'react-easy-crop'

const CropperComponent = Cropper as any

type Props = {
    imageSrc: string
    isOpen: boolean
    onSave: (croppedImage: string) => void
    onCancel: () => void
}

const createImage = (url: string): Promise<HTMLImageElement> => {
    return new Promise((resolve, reject) => {
        const image = new Image()
        image.addEventListener('load', () => resolve(image))
        image.addEventListener('error', error => reject(error))
        image.src = url
    })
}

const getCroppedImg = async (imageSrc: string, pixelCrop: Area): Promise<string> => {
    const image = await createImage(imageSrc)
    const canvas = document.createElement('canvas')
    const ctx = canvas.getContext('2d')

    if (!ctx) {
        throw new Error('Failed to get canvas context')
    }

    canvas.width = 256
    canvas.height = 284

    const scaleX = 256 / pixelCrop.width
    const scaleY = 284 / pixelCrop.height
    const scale = Math.min(scaleX, scaleY)

    const offsetX = (256 - pixelCrop.width * scale) / 2
    const offsetY = (284 - pixelCrop.height * scale) / 2

    ctx.fillStyle = '#ffffff'
    ctx.fillRect(0, 0, 256, 284)

    ctx.drawImage(
        image,
        pixelCrop.x,
        pixelCrop.y,
        pixelCrop.width,
        pixelCrop.height,
        offsetX,
        offsetY,
        pixelCrop.width * scale,
        pixelCrop.height * scale
    )

    return canvas.toDataURL('image/jpeg', 0.9)
}

const ImageCropModal: FC<Props> = ({ imageSrc, isOpen, onSave, onCancel }) => {
    const [crop, setCrop] = useState({ x: 0, y: 0 })
    const [zoom, setZoom] = useState(1)
    const [croppedAreaPixels, setCroppedAreaPixels] = useState<Area | null>(null)

    const onCropComplete = useCallback((croppedArea: Area, croppedAreaPixels: Area) => {
        setCroppedAreaPixels(croppedAreaPixels)
    }, [])

    const handleSave = async () => {
        if (croppedAreaPixels) {
            try {
                const croppedImage = await getCroppedImg(imageSrc, croppedAreaPixels)
                onSave(croppedImage)
            } catch (error) {
                console.error('Error cropping image:', error)
            }
        }
    }

    if (!isOpen) {
        return null
    }

    return (
        <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.8)',
            zIndex: 9999,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
        }}>
            <div style={{
                backgroundColor: 'white',
                borderRadius: '8px',
                padding: '20px',
                width: '90vw',
                maxWidth: '600px',
                height: '80vh',
                display: 'flex',
                flexDirection: 'column'
            }}>
                <h3 style={{ margin: '0 0 20px 0', textAlign: 'center' }}>
                    Crop Image (256 x 284)
                </h3>

                <div style={{
                    position: 'relative',
                    flex: 1,
                    backgroundColor: '#f0f0f0',
                    marginBottom: '20px'
                }}>
                    <CropperComponent
                        image={imageSrc}
                        crop={crop}
                        zoom={zoom}
                        rotation={0}
                        aspect={256 / 284}
                        minZoom={1}
                        maxZoom={3}
                        cropShape="rect"
                        showGrid={true}
                        zoomSpeed={1}
                        restrictPosition={true}
                        onCropChange={setCrop}
                        onZoomChange={setZoom}
                        onCropComplete={onCropComplete}
                        style={{
                            containerStyle: {
                                width: '100%',
                                height: '100%',
                                backgroundColor: '#f0f0f0'
                            }
                        }}
                        classes={{}}
                        mediaProps={{}}
                        cropperProps={{}}
                        keyboardStep={1}
                    />
                </div>

                <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    marginBottom: '20px',
                    gap: '10px'
                }}>
                    <span style={{ minWidth: '50px' }}>Zoom:</span>
                    <input
                        type="range"
                        min={1}
                        max={3}
                        step={0.1}
                        value={zoom}
                        onChange={(e) => setZoom(parseFloat(e.target.value))}
                        style={{ flex: 1 }}
                    />
                </div>

                <div style={{
                    display: 'flex',
                    gap: '10px',
                    justifyContent: 'flex-end'
                }}>
                    <button
                        onClick={onCancel}
                        style={{
                            padding: '10px 20px',
                            border: '1px solid #ccc',
                            backgroundColor: 'white',
                            borderRadius: '4px',
                            cursor: 'pointer'
                        }}
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleSave}
                        style={{
                            padding: '10px 20px',
                            border: 'none',
                            backgroundColor: '#007bff',
                            color: 'white',
                            borderRadius: '4px',
                            cursor: 'pointer'
                        }}
                    >
                        Save
                    </button>
                </div>
            </div>
        </div>
    )
}

export default ImageCropModal
