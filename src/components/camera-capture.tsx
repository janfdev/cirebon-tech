"use client"

import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Camera } from "lucide-react"
import { toast } from "sonner"

interface CameraCaptureProps {
  onCapture: (file: File) => void
  onCameraStateChange?: (isActive: boolean) => void
  disabled?: boolean
}

export function CameraCapture({ onCapture, onCameraStateChange, disabled = false }: CameraCaptureProps) {
  const [isCameraActive, setIsCameraActive] = useState(false)
  const videoRef = useRef<HTMLVideoElement>(null)
  const streamRef = useRef<MediaStream | null>(null)

  useEffect(() => {
    onCameraStateChange?.(isCameraActive)
  }, [isCameraActive, onCameraStateChange])

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop())
      streamRef.current = null
    }
    setIsCameraActive(false)
  }

  const handleCameraOpen = async () => {
    if (isCameraActive) {
      stopCamera()
      return
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "environment" },
        audio: false,
      })
      streamRef.current = stream
      setIsCameraActive(true)

      // Wait for DOM update, then attach stream
      requestAnimationFrame(() => {
        if (videoRef.current) {
          videoRef.current.srcObject = stream
          videoRef.current.play().catch(() => toast.error("Tap layar sekali untuk mulai preview kamera"))
        }
      })
    } catch (e) {
      console.error(e)
      toast.error("Gagal mengakses kamera. Pastikan izin sudah diberikan.")
    }
  }

  const handleCapture = () => {
    if (videoRef.current) {
      const canvas = document.createElement("canvas")
      canvas.width = videoRef.current.videoWidth
      canvas.height = videoRef.current.videoHeight
      const context = canvas.getContext("2d")

      if (context) {
        context.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height)
        canvas.toBlob((blob) => {
          if (blob) {
            const capturedFile = new File([blob], "captured_image.png", {
              type: "image/png",
            })
            onCapture(capturedFile)
            stopCamera()
          }
        }, "image/png")
      }
    }
  }

  return (
    <div className="space-y-2">
      <Button
        onClick={handleCameraOpen}
        disabled={disabled}
        variant="outline"
        className="w-full flex items-center gap-2 bg-transparent"
      >
        <Camera className="h-4 w-4" />
        {isCameraActive ? "Tutup Kamera" : "Ambil dari Kamera"}
      </Button>

      {isCameraActive && (
        <div className="space-y-2">
          <video
            ref={videoRef}
            autoPlay
            playsInline
            muted
            className="w-full rounded-md bg-black"
            style={{ minHeight: 240 }}
          />
          <Button onClick={handleCapture} className="w-full">
            <Camera className="h-4 w-4 mr-2" />
            Ambil Foto
          </Button>
        </div>
      )}
    </div>
  )
}
