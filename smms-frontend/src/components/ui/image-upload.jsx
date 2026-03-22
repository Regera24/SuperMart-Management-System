import { useState, useRef, useCallback } from "react"
import { Upload, X, Loader2 } from "lucide-react"
import { cn } from "@/lib/utils"

export default function ImageUpload({ value = [], onChange, maxFiles = 5, maxSizeMB = 5, accept = "image/jpeg,image/png,image/webp", className }) {
  const [dragOver, setDragOver] = useState(false)
  const inputRef = useRef(null)

  const handleFiles = useCallback((fileList) => {
    const files = Array.from(fileList)
    const maxSize = maxSizeMB * 1024 * 1024
    const validFiles = files.filter((f) => {
      if (!accept.split(",").some((t) => f.type === t.trim())) { alert(`File "${f.name}" không đúng định dạng.`); return false }
      if (f.size > maxSize) { alert(`File "${f.name}" quá lớn. Tối đa ${maxSizeMB}MB`); return false }
      return true
    })
    if (value.length + validFiles.length > maxFiles) { alert(`Tối đa ${maxFiles} ảnh`); return }
    const newImages = validFiles.map((file) => ({ file, preview: URL.createObjectURL(file), name: file.name, size: file.size }))
    onChange?.([...value, ...newImages])
  }, [value, onChange, maxFiles, maxSizeMB, accept])

  const removeImage = (index) => {
    const updated = [...value]
    if (updated[index].preview) URL.revokeObjectURL(updated[index].preview)
    updated.splice(index, 1)
    onChange?.(updated)
  }

  return (
    <div className={cn("space-y-3", className)}>
      <div
        onDragOver={(e) => { e.preventDefault(); setDragOver(true) }}
        onDragLeave={() => setDragOver(false)}
        onDrop={(e) => { e.preventDefault(); setDragOver(false); handleFiles(e.dataTransfer.files) }}
        onClick={() => inputRef.current?.click()}
        className={cn("relative flex flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed p-8 cursor-pointer transition-all", dragOver ? "border-primary bg-primary/5 scale-[1.01]" : "border-muted-foreground/25 hover:border-primary/50 hover:bg-muted/50")}
      >
        <input ref={inputRef} type="file" accept={accept} multiple={maxFiles > 1} onChange={(e) => handleFiles(e.target.files)} className="hidden" />
        <div className="rounded-full bg-primary/10 p-3"><Upload className="h-6 w-6 text-primary" /></div>
        <div className="text-center">
          <p className="text-sm font-medium">Kéo thả ảnh vào đây hoặc <span className="text-primary">nhấn để chọn</span></p>
          <p className="text-xs text-muted-foreground mt-1">PNG, JPG, WebP • Tối đa {maxSizeMB}MB • {maxFiles} ảnh</p>
        </div>
      </div>
      {value.length > 0 && (
        <div className="grid grid-cols-5 gap-3">
          {value.map((img, idx) => (
            <div key={idx} className="group relative aspect-square rounded-xl overflow-hidden border bg-muted">
              <img src={img.preview || img.url} alt={img.name || `Ảnh ${idx + 1}`} className="h-full w-full object-cover transition-transform group-hover:scale-105" />
              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                <button onClick={(e) => { e.stopPropagation(); removeImage(idx) }} className="rounded-full bg-destructive p-1.5 text-white shadow-lg hover:bg-destructive/90"><X className="h-4 w-4" /></button>
              </div>
              {idx === 0 && <span className="absolute top-1 left-1 rounded bg-primary px-1.5 py-0.5 text-[10px] font-bold text-white">Chính</span>}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
