"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import Cropper, { type Area } from "react-easy-crop";

interface ImageUploaderProps {
  initialUrls?: string[];
  onChange: (urls: string[]) => void;
}

type AspectOption = {
  label: string;
  value: number | undefined;
};

const ASPECT_OPTIONS: AspectOption[] = [
  { label: "Product (1:1.15)", value: 1 / 1.15 },
  { label: "Square (1:1)", value: 1 },
  { label: "Free", value: undefined },
];

type CropSession = {
  src: string;
  fileName: string;
  /** When set, replace this preview index after upload instead of appending */
  replaceIndex?: number;
  revokeOnClose?: boolean;
};

async function loadImage(imageSrc: string) {
  return new Promise<HTMLImageElement>((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error("Could not load image for crop"));
    img.src = imageSrc;
  });
}

async function getCroppedBlob(imageSrc: string, crop: Area, fileName: string): Promise<File> {
  const image = await loadImage(imageSrc);
  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Canvas not supported");

  const width = Math.max(1, Math.round(crop.width));
  const height = Math.max(1, Math.round(crop.height));
  canvas.width = width;
  canvas.height = height;

  ctx.drawImage(image, crop.x, crop.y, crop.width, crop.height, 0, 0, width, height);

  const blob = await new Promise<Blob>((resolve, reject) => {
    canvas.toBlob(
      (b) => (b ? resolve(b) : reject(new Error("Crop failed"))),
      "image/jpeg",
      0.92
    );
  });

  const base = fileName.replace(/\.[^.]+$/, "") || "product-image";
  return new File([blob], `${base}-cropped.jpg`, { type: "image/jpeg" });
}

async function getCroppedPreviewUrl(imageSrc: string, crop: Area): Promise<string> {
  const image = await loadImage(imageSrc);
  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Canvas not supported");

  // Keep preview snappy — max ~640px wide
  const maxW = 640;
  const scale = Math.min(1, maxW / Math.max(crop.width, 1));
  const width = Math.max(1, Math.round(crop.width * scale));
  const height = Math.max(1, Math.round(crop.height * scale));
  canvas.width = width;
  canvas.height = height;
  ctx.drawImage(image, crop.x, crop.y, crop.width, crop.height, 0, 0, width, height);

  return canvas.toDataURL("image/jpeg", 0.85);
}

function WebsitePreviewCard({ previewUrl }: { previewUrl: string | null }) {
  return (
    <div className="rounded-lg border border-slate-600 bg-white p-3 text-black shadow-lg">
      <p className="mb-2 text-[10px] font-bold uppercase tracking-[0.16em] text-neutral-500">
        Website preview
      </p>
      <div className="relative aspect-[1/1.15] overflow-hidden bg-neutral-100">
        {previewUrl ? (
          // Same framing as storefront: width-fitted, bottom-anchored
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={previewUrl}
            alt="Website preview"
            className="absolute inset-x-0 bottom-0 block h-auto w-full"
          />
        ) : (
          <div className="flex h-full items-center justify-center text-[11px] text-neutral-400">
            Adjust crop to preview
          </div>
        )}
        <span className="absolute left-1.5 top-1.5 bg-black px-1.5 py-0.5 text-[8px] font-bold uppercase tracking-wide text-white">
          In stock
        </span>
      </div>
      <div className="mt-2">
        <p className="text-[10px] uppercase tracking-wide text-neutral-500">1 color</p>
        <div className="mt-0.5 flex items-start justify-between gap-2">
          <p className="text-[12px] font-semibold leading-snug">Your product</p>
          <p className="shrink-0 text-[12px] font-semibold">Rs —</p>
        </div>
        <p className="mt-0.5 text-[11px] text-neutral-600">As shown on shop</p>
      </div>
    </div>
  );
}

export default function ImageUploader({ initialUrls, onChange }: ImageUploaderProps) {
  const urls = initialUrls ?? [];
  const [previews, setPreviews] = useState<string[]>(() => [...urls]);
  const lastSerialized = useRef<string>("");

  useEffect(() => {
    const next = [...urls];
    const key = next.join("\0");
    if (key === lastSerialized.current) return;
    lastSerialized.current = key;
    setPreviews(next);
  }, [urls]);

  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const [cropSession, setCropSession] = useState<CropSession | null>(null);
  const [pendingQueue, setPendingQueue] = useState<File[]>([]);
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [aspect, setAspect] = useState<number | undefined>(1 / 1.15);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<Area | null>(null);
  const [livePreviewUrl, setLivePreviewUrl] = useState<string | null>(null);
  const previewTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const previewGen = useRef(0);

  const closeCrop = useCallback(() => {
    if (previewTimer.current) clearTimeout(previewTimer.current);
    setLivePreviewUrl(null);
    setCropSession((current) => {
      if (current?.revokeOnClose && current.src.startsWith("blob:")) {
        URL.revokeObjectURL(current.src);
      }
      return null;
    });
    setPendingQueue([]);
    setCrop({ x: 0, y: 0 });
    setZoom(1);
    setCroppedAreaPixels(null);
  }, []);

  const openCropForFile = useCallback((file: File, rest: File[] = [], replaceIndex?: number) => {
    const src = URL.createObjectURL(file);
    setCrop({ x: 0, y: 0 });
    setZoom(1);
    setCroppedAreaPixels(null);
    setLivePreviewUrl(null);
    setPendingQueue(rest);
    setCropSession({
      src,
      fileName: file.name || "product-image.jpg",
      replaceIndex,
      revokeOnClose: true,
    });
  }, []);

  const scheduleLivePreview = useCallback((src: string, area: Area) => {
    if (previewTimer.current) clearTimeout(previewTimer.current);
    previewTimer.current = setTimeout(() => {
      const gen = ++previewGen.current;
      void getCroppedPreviewUrl(src, area)
        .then((url) => {
          if (gen === previewGen.current) setLivePreviewUrl(url);
        })
        .catch(() => {
          if (gen === previewGen.current) setLivePreviewUrl(null);
        });
    }, 60);
  }, []);

  useEffect(() => {
    return () => {
      if (previewTimer.current) clearTimeout(previewTimer.current);
    };
  }, []);

  const uploadFiles = useCallback(
    async (files: File[], replaceIndex?: number) => {
      if (files.length === 0) return;
      setUploading(true);
      setError("");

      try {
        const formData = new FormData();
        files.forEach((f) => formData.append("images", f));

        const res = await fetch("/api/upload", { method: "POST", body: formData });
        const data = await res.json();

        if (!res.ok) throw new Error(data.error || "Upload failed");

        const uploaded = (data.urls as string[]) || [];
        let newUrls: string[];
        if (typeof replaceIndex === "number" && uploaded[0]) {
          newUrls = previews.map((url, i) => (i === replaceIndex ? uploaded[0] : url));
        } else {
          newUrls = [...previews, ...uploaded];
        }
        setPreviews(newUrls);
        onChange(newUrls);
      } catch (e) {
        setError(e instanceof Error ? e.message : "Upload failed");
      } finally {
        setUploading(false);
      }
    },
    [previews, onChange]
  );

  const handleFilesSelected = useCallback(
    (files: File[]) => {
      if (files.length === 0) return;
      const [first, ...rest] = files;
      openCropForFile(first, rest);
    },
    [openCropForFile]
  );

  const applyCropAndUpload = useCallback(async () => {
    if (!cropSession || !croppedAreaPixels) {
      setError("Adjust the crop area first.");
      return;
    }

    setUploading(true);
    setError("");
    try {
      const croppedFile = await getCroppedBlob(
        cropSession.src,
        croppedAreaPixels,
        cropSession.fileName
      );

      if (cropSession.revokeOnClose && cropSession.src.startsWith("blob:")) {
        URL.revokeObjectURL(cropSession.src);
      }

      const replaceIndex = cropSession.replaceIndex;
      const queue = [...pendingQueue];
      setCropSession(null);
      setPendingQueue([]);
      setCrop({ x: 0, y: 0 });
      setZoom(1);
      setCroppedAreaPixels(null);
      setLivePreviewUrl(null);

      await uploadFiles([croppedFile], replaceIndex);

      if (queue.length > 0) {
        const [next, ...rest] = queue;
        openCropForFile(next, rest);
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : "Crop failed");
      setUploading(false);
    }
  }, [cropSession, croppedAreaPixels, pendingQueue, uploadFiles, openCropForFile]);

  const skipCropUploadOriginal = useCallback(async () => {
    if (!cropSession) return;

    try {
      const res = await fetch(cropSession.src);
      const blob = await res.blob();
      const file = new File([blob], cropSession.fileName, {
        type: blob.type || "image/jpeg",
      });

      if (cropSession.revokeOnClose && cropSession.src.startsWith("blob:")) {
        URL.revokeObjectURL(cropSession.src);
      }

      const replaceIndex = cropSession.replaceIndex;
      const queue = [...pendingQueue];
      setCropSession(null);
      setPendingQueue([]);
      setLivePreviewUrl(null);

      await uploadFiles([file], replaceIndex);

      if (queue.length > 0) {
        const [next, ...rest] = queue;
        openCropForFile(next, rest);
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : "Upload failed");
    }
  }, [cropSession, pendingQueue, uploadFiles, openCropForFile]);

  const removeImage = (index: number) => {
    const newUrls = previews.filter((_, i) => i !== index);
    setPreviews(newUrls);
    onChange(newUrls);
  };

  const adjustExisting = (index: number) => {
    const url = previews[index];
    if (!url) return;
    setCrop({ x: 0, y: 0 });
    setZoom(1);
    setCroppedAreaPixels(null);
    setLivePreviewUrl(null);
    setPendingQueue([]);
    setCropSession({
      src: url,
      fileName: `product-image-${index + 1}.jpg`,
      replaceIndex: index,
      revokeOnClose: false,
    });
  };

  return (
    <div className="space-y-4">
      <label className="block cursor-pointer">
        <input
          type="file"
          multiple
          accept="image/*"
          className="sr-only"
          onChange={(e) => {
            const files = Array.from(e.target.files || []);
            handleFilesSelected(files);
            e.target.value = "";
          }}
          disabled={uploading || Boolean(cropSession)}
        />
        <div className="border-2 border-dashed border-slate-600 rounded-lg p-8 text-center hover:border-indigo-500 transition-colors">
          {uploading && !cropSession ? (
            <div className="flex flex-col items-center gap-3">
              <div className="w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
              <p className="text-slate-400 text-sm">Uploading to Cloudinary…</p>
            </div>
          ) : (
            <>
              <svg className="w-10 h-10 text-slate-500 mx-auto mb-3" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5m-13.5-9L12 3m0 0 4.5 4.5M12 3v13.5" />
              </svg>
              <p className="text-slate-300 text-sm font-medium">Click to upload images</p>
              <p className="text-slate-500 text-xs mt-1">
                Crop, adjust & preview how it looks on the website
              </p>
            </>
          )}
        </div>
      </label>

      {error && <p className="text-red-400 text-sm">{error}</p>}

      {previews.length > 0 && (
        <div className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-6 gap-3">
          {previews.map((url, i) => (
            <div key={url + i} className="relative group aspect-square">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={url}
                alt={`Product image ${i + 1}`}
                className="w-full h-full object-cover rounded-lg border border-slate-600"
              />
              <div className="absolute inset-x-0 bottom-0 flex gap-1 p-1 opacity-0 transition-opacity group-hover:opacity-100">
                <button
                  type="button"
                  onClick={() => adjustExisting(i)}
                  disabled={uploading || Boolean(cropSession)}
                  className="flex-1 rounded bg-slate-900/85 px-1 py-1 text-[10px] font-semibold uppercase tracking-wide text-white hover:bg-indigo-600 disabled:opacity-50"
                >
                  Adjust
                </button>
                <button
                  type="button"
                  onClick={() => removeImage(i)}
                  className="rounded bg-red-600/90 px-2 py-1 text-[10px] font-semibold text-white hover:bg-red-500"
                >
                  ×
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {cropSession ? (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/75 p-3 sm:p-4">
          <div
            className="flex max-h-[96vh] w-full max-w-5xl flex-col overflow-hidden rounded-xl border border-slate-700 bg-slate-900 shadow-2xl"
            role="dialog"
            aria-modal="true"
            aria-labelledby="crop-title"
          >
            <div className="flex items-center justify-between border-b border-slate-700 px-4 py-3">
              <div>
                <h3 id="crop-title" className="text-sm font-bold uppercase tracking-widest text-slate-200">
                  Adjust, crop & preview
                </h3>
                <p className="mt-0.5 text-xs text-slate-500">
                  Left: crop · Right: how it will look on the shop
                  {pendingQueue.length > 0 ? ` · ${pendingQueue.length} more in queue` : ""}
                </p>
              </div>
              <button
                type="button"
                onClick={closeCrop}
                className="text-slate-400 hover:text-white"
                aria-label="Cancel crop"
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" aria-hidden>
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            </div>

            <div className="grid min-h-0 flex-1 gap-0 overflow-y-auto lg:grid-cols-[1fr_260px]">
              <div className="relative h-[min(48vh,380px)] bg-slate-950 lg:h-[min(58vh,460px)]">
                <Cropper
                  image={cropSession.src}
                  crop={crop}
                  zoom={zoom}
                  aspect={aspect}
                  onCropChange={setCrop}
                  onZoomChange={setZoom}
                  onCropComplete={(_, pixels) => {
                    setCroppedAreaPixels(pixels);
                    scheduleLivePreview(cropSession.src, pixels);
                  }}
                  onCropAreaChange={(_, pixels) => {
                    setCroppedAreaPixels(pixels);
                    scheduleLivePreview(cropSession.src, pixels);
                  }}
                  showGrid
                />
              </div>

              <div className="border-t border-slate-700 bg-slate-900/80 p-4 lg:border-l lg:border-t-0">
                <WebsitePreviewCard previewUrl={livePreviewUrl} />
                <p className="mt-3 text-[11px] leading-relaxed text-slate-500">
                  Move / zoom on the left. This card updates live so you can match the storefront framing.
                </p>
              </div>
            </div>

            <div className="space-y-4 border-t border-slate-700 px-4 py-4">
              <div className="flex flex-wrap gap-2">
                {ASPECT_OPTIONS.map((opt) => {
                  const active = aspect === opt.value;
                  return (
                    <button
                      key={opt.label}
                      type="button"
                      onClick={() => setAspect(opt.value)}
                      className={`rounded-md px-3 py-1.5 text-[11px] font-semibold uppercase tracking-wide transition-colors ${
                        active
                          ? "bg-indigo-600 text-white"
                          : "bg-slate-800 text-slate-300 hover:bg-slate-700"
                      }`}
                    >
                      {opt.label}
                    </button>
                  );
                })}
              </div>

              <label className="block">
                <span className="mb-1.5 block text-[10px] font-semibold uppercase tracking-widest text-slate-400">
                  Zoom / adjust
                </span>
                <input
                  type="range"
                  min={1}
                  max={3}
                  step={0.05}
                  value={zoom}
                  onChange={(e) => setZoom(Number(e.target.value))}
                  className="w-full accent-indigo-500"
                />
              </label>

              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={closeCrop}
                  disabled={uploading}
                  className="rounded-lg border border-slate-600 px-4 py-2.5 text-xs font-semibold uppercase tracking-widest text-slate-300 hover:border-slate-400 disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={() => void skipCropUploadOriginal()}
                  disabled={uploading}
                  className="rounded-lg border border-slate-600 px-4 py-2.5 text-xs font-semibold uppercase tracking-widest text-slate-300 hover:border-slate-400 disabled:opacity-50"
                >
                  Upload as-is
                </button>
                <button
                  type="button"
                  onClick={() => void applyCropAndUpload()}
                  disabled={uploading || !croppedAreaPixels}
                  className="ml-auto rounded-lg bg-indigo-600 px-5 py-2.5 text-xs font-semibold uppercase tracking-widest text-white hover:bg-indigo-500 disabled:opacity-50"
                >
                  {uploading ? "Uploading…" : "Crop & upload"}
                </button>
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
