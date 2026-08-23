import { useCallback, useRef, useState } from "react";
import { Crop, ImagePlus, Loader2, RefreshCw, Trash2, UploadCloud } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Slider } from "@/components/ui/slider";
import { cn } from "@/lib/utils";
import { MAX_COVER_BYTES, validateCoverFile } from "@/lib/campaign-composer";

type Props = {
  value: string | null;
  fileName: string | null;
  error?: string;
  onChange: (dataUrl: string | null, fileName: string | null) => void;
};

export function CoverUploader({ value, fileName, error, onChange }: Props) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragging, setDragging] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [localError, setLocalError] = useState<string | null>(null);
  const [rawImage, setRawImage] = useState<string | null>(null);
  const [pendingName, setPendingName] = useState<string | null>(null);
  const [zoom, setZoom] = useState(1);
  const [offsetX, setOffsetX] = useState(50);
  const [offsetY, setOffsetY] = useState(50);

  const readFile = useCallback((file: File) => {
    const err = validateCoverFile(file);
    setLocalError(err);
    if (err) return;
    setUploading(true);
    setProgress(8);
    const reader = new FileReader();
    reader.onprogress = (ev) => {
      if (ev.lengthComputable) setProgress(Math.round((ev.loaded / ev.total) * 90));
    };
    reader.onload = () => {
      setProgress(100);
      setTimeout(() => {
        setUploading(false);
        setRawImage(String(reader.result));
        setPendingName(file.name);
        setZoom(1);
        setOffsetX(50);
        setOffsetY(50);
      }, 250);
    };
    reader.onerror = () => {
      setUploading(false);
      setLocalError("Không đọc được tệp ảnh. Vui lòng thử lại.");
    };
    reader.readAsDataURL(file);
  }, []);

  const applyCrop = () => {
    if (!rawImage) return;
    const img = new Image();
    img.onload = () => {
      const targetW = 1200;
      const targetH = 900; // 4:3
      const canvas = document.createElement("canvas");
      canvas.width = targetW;
      canvas.height = targetH;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;
      const scale = Math.max(targetW / img.width, targetH / img.height) * zoom;
      const w = img.width * scale;
      const h = img.height * scale;
      const x = (targetW - w) * (offsetX / 100);
      const y = (targetH - h) * (offsetY / 100);
      ctx.fillStyle = "#ffffff";
      ctx.fillRect(0, 0, targetW, targetH);
      ctx.drawImage(img, x, y, w, h);
      onChange(canvas.toDataURL("image/jpeg", 0.9), pendingName);
      setRawImage(null);
    };
    img.src = rawImage;
  };

  return (
    <div>
      <input
        ref={inputRef}
        id="coverDataUrl"
        type="file"
        accept="image/jpeg,image/png,image/webp,image/gif"
        className="sr-only"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) readFile(file);
          e.target.value = "";
        }}
      />

      {value ? (
        <div className="overflow-hidden rounded-[22px] border border-border bg-surface-2">
          <div className="relative aspect-[4/3] w-full">
            <img src={value} alt="Ảnh bìa chiến dịch" className="size-full object-cover" />
            <span className="absolute left-3 top-3 rounded-full bg-success px-2.5 py-1 text-[11px] font-bold text-success-foreground">
              Đã tải lên · 4:3
            </span>
          </div>
          <div className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3 p-3 sm:flex sm:justify-between">
            <p className="min-w-0 truncate text-xs text-muted-foreground">{fileName ?? "cover.jpg"}</p>
            <div className="flex shrink-0 gap-2">
              <Button type="button" size="sm" variant="outline" onClick={() => inputRef.current?.click()}>
                <RefreshCw className="size-3.5" /> Đổi ảnh
              </Button>
              <Button
                type="button"
                size="sm"
                variant="ghost"
                className="text-destructive hover:text-destructive"
                onClick={() => onChange(null, null)}
              >
                <Trash2 className="size-3.5" /> Xoá
              </Button>
            </div>
          </div>
        </div>
      ) : (
        <div
          role="button"
          tabIndex={0}
          onClick={() => inputRef.current?.click()}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") inputRef.current?.click();
          }}
          onDragOver={(e) => {
            e.preventDefault();
            setDragging(true);
          }}
          onDragLeave={() => setDragging(false)}
          onDrop={(e) => {
            e.preventDefault();
            setDragging(false);
            const file = e.dataTransfer.files?.[0];
            if (file) readFile(file);
          }}
          className={cn(
            "flex aspect-[4/3] w-full cursor-pointer flex-col items-center justify-center gap-3 rounded-[22px] border-2 border-dashed border-input bg-surface-2 px-6 text-center transition-colors",
            "hover:border-primary/60 hover:bg-primary/[0.04] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
            dragging && "border-primary bg-primary/[0.06]",
            (error || localError) && "border-destructive/60",
          )}
        >
          {uploading ? (
            <>
              <Loader2 className="size-7 animate-spin text-primary" />
              <p className="text-sm font-semibold">Đang tải ảnh… {progress}%</p>
              <div className="h-1.5 w-40 overflow-hidden rounded-full bg-muted">
                <div
                  className="h-full rounded-full bg-primary transition-all"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </>
          ) : (
            <>
              <span className="grid size-12 place-items-center rounded-2xl bg-primary/10 text-primary">
                <ImagePlus className="size-6" />
              </span>
              <div>
                <p className="text-sm font-bold">Kéo & thả ảnh bìa vào đây</p>
                <p className="mt-1 text-xs text-muted-foreground">
                  hoặc bấm để chọn tệp · JPEG, PNG, WebP, GIF · tối đa{" "}
                  {Math.round(MAX_COVER_BYTES / (1024 * 1024))} MB
                </p>
              </div>
              <span className="inline-flex items-center gap-1.5 rounded-full border border-input px-3 py-1.5 text-xs font-semibold">
                <UploadCloud className="size-3.5" /> Chọn ảnh
              </span>
            </>
          )}
        </div>
      )}

      {localError ? (
        <p role="alert" className="mt-1.5 text-xs font-medium text-destructive">
          {localError}
        </p>
      ) : null}

      <Dialog open={!!rawImage} onOpenChange={(o) => !o && setRawImage(null)}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Crop className="size-4 text-primary" /> Cắt ảnh bìa theo tỉ lệ 4:3
            </DialogTitle>
          </DialogHeader>
          <div className="overflow-hidden rounded-2xl border border-border bg-surface-2">
            <div className="relative aspect-[4/3] w-full overflow-hidden">
              {rawImage ? (
                <img
                  src={rawImage}
                  alt="Xem trước ảnh bìa"
                  className="absolute size-full object-cover"
                  style={{
                    transform: `scale(${zoom})`,
                    objectPosition: `${offsetX}% ${offsetY}%`,
                  }}
                />
              ) : null}
            </div>
          </div>
          <div className="space-y-4">
            <CropSlider label="Thu phóng" value={zoom * 100} min={100} max={250} onChange={(v) => setZoom(v / 100)} />
            <CropSlider label="Ngang" value={offsetX} min={0} max={100} onChange={setOffsetX} />
            <CropSlider label="Dọc" value={offsetY} min={0} max={100} onChange={setOffsetY} />
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setRawImage(null)}>
              Huỷ
            </Button>
            <Button type="button" onClick={applyCrop}>
              Dùng ảnh này
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function CropSlider({
  label,
  value,
  min,
  max,
  onChange,
}: {
  label: string;
  value: number;
  min: number;
  max: number;
  onChange: (v: number) => void;
}) {
  return (
    <div className="flex items-center gap-4">
      <span className="w-20 shrink-0 text-xs font-semibold text-muted-foreground">{label}</span>
      <Slider value={[value]} min={min} max={max} step={1} onValueChange={([v]) => onChange(v)} />
    </div>
  );
}
