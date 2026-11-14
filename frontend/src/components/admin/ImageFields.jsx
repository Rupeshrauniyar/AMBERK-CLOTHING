import { useRef, useState } from 'react';
import { ArrowLeft, ArrowRight, ImagePlus, Link2, Loader2, Star, Trash2, Upload } from 'lucide-react';
import { toast } from 'sonner';
import { fetchApi } from '../../services/api';
import { cn } from '../../lib/utils';
import Button from '../ui/Button';
import { Field } from './ui';

const ACCEPT = 'image/jpeg,image/png,image/webp,image/svg+xml';
const MAX_BYTES = 10 * 1024 * 1024;

/** Upload a single file to POST /admin/upload → ImageAsset { url, publicId, provider } */
export async function uploadImage(file) {
  if (file.size > MAX_BYTES) throw new Error(`${file.name} is larger than 10 MB.`);
  const body = new FormData();
  body.append('image', file);
  return fetchApi('/admin/upload', { method: 'POST', body });
}

const isUrl = (v) => /^(https?:\/\/|\/)/i.test(v.trim());

/** Single image (url + upload). value: ImageAsset | null */
export function SingleImageField({ label, hint, value, onChange, alt = '', aspect = 'aspect-[4/3]' }) {
  const inputRef = useRef(null);
  const [busy, setBusy] = useState(false);
  const url = value?.url || '';

  const onFile = async (file) => {
    if (!file) return;
    setBusy(true);
    try {
      const asset = await uploadImage(file);
      onChange({ ...asset, alt: value?.alt || alt });
      toast.success('Image uploaded');
    } catch (e) {
      toast.error(e.message || 'Upload failed');
    } finally {
      setBusy(false);
      if (inputRef.current) inputRef.current.value = '';
    }
  };

  return (
    <Field label={label} hint={hint}>
      <div className="flex flex-col gap-3 sm:flex-row">
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          className={cn(
            'group relative w-full shrink-0 overflow-hidden rounded-2xl border border-dashed border-line bg-ivory transition-colors hover:border-ink/40 sm:w-44',
            aspect
          )}
          aria-label={url ? 'Replace image' : 'Upload image'}
        >
          {url ? (
            <img src={url} alt="" className="absolute inset-0 h-full w-full object-cover" />
          ) : (
            <span className="absolute inset-0 flex flex-col items-center justify-center gap-1.5 text-xs text-mute">
              <ImagePlus className="h-5 w-5" />
              Upload
            </span>
          )}
          {busy && (
            <span className="absolute inset-0 grid place-items-center bg-white/70">
              <Loader2 className="h-5 w-5 animate-spin" />
            </span>
          )}
        </button>
        <div className="min-w-0 flex-1 space-y-2">
          <div className="relative">
            <Link2 className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-mute" />
            <input
              type="text"
              inputMode="url"
              value={url}
              placeholder="Paste an image URL…"
              onChange={(e) => {
                const v = e.target.value;
                onChange(v ? { url: v, publicId: '', provider: 'external', alt: value?.alt || alt } : null);
              }}
              className="field !rounded-xl !py-2.5 !pl-10 !text-sm"
            />
          </div>
          <input
            type="text"
            value={value?.alt || ''}
            disabled={!url}
            placeholder="Alt text (describe the image)"
            onChange={(e) => onChange({ ...value, alt: e.target.value })}
            className="field !rounded-xl !py-2.5 !text-sm disabled:bg-sand"
          />
          <div className="flex flex-wrap gap-2">
            <Button type="button" size="sm" variant="outline" loading={busy} onClick={() => inputRef.current?.click()}>
              {!busy && <Upload className="h-3.5 w-3.5" />} {url ? 'Replace' : 'Upload'}
            </Button>
            {url && (
              <Button type="button" size="sm" variant="ghost" className="text-danger" onClick={() => onChange(null)}>
                <Trash2 className="h-3.5 w-3.5" /> Remove
              </Button>
            )}
          </div>
        </div>
      </div>
      <input ref={inputRef} type="file" accept={ACCEPT} hidden onChange={(e) => onFile(e.target.files?.[0])} />
    </Field>
  );
}

/** Multiple images with upload, URL input, reorder and primary selection. images: ImageAsset[] */
export function MultiImageField({ images = [], onChange, altBase = '' }) {
  const inputRef = useRef(null);
  const [busy, setBusy] = useState(0);
  const [urlDraft, setUrlDraft] = useState('');
  const [dragOver, setDragOver] = useState(false);

  const addFiles = async (fileList) => {
    const files = Array.from(fileList || []);
    if (!files.length) return;
    setBusy(files.length);
    const added = [];
    for (const file of files) {
      try {
        const asset = await uploadImage(file);
        added.push({ ...asset, alt: altBase });
      } catch (e) {
        toast.error(e.message || `Could not upload ${file.name}`);
      } finally {
        setBusy((n) => Math.max(0, n - 1));
      }
    }
    if (added.length) {
      onChange([...images, ...added]);
      toast.success(`${added.length} image${added.length > 1 ? 's' : ''} uploaded`);
    }
    if (inputRef.current) inputRef.current.value = '';
  };

  const addUrl = () => {
    const v = urlDraft.trim();
    if (!v) return;
    if (!isUrl(v)) {
      toast.error('Enter a valid image URL (https://…)');
      return;
    }
    onChange([...images, { url: v, publicId: '', provider: 'external', alt: altBase }]);
    setUrlDraft('');
  };

  const move = (from, to) => {
    if (to < 0 || to >= images.length) return;
    const next = [...images];
    const [item] = next.splice(from, 1);
    next.splice(to, 0, item);
    onChange(next);
  };

  const remove = (i) => onChange(images.filter((_, idx) => idx !== i));
  const setAlt = (i, alt) => onChange(images.map((img, idx) => (idx === i ? { ...img, alt } : img)));

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        {images.map((img, i) => (
          <div key={`${img.url}-${i}`} className="group overflow-hidden rounded-2xl border border-line bg-white">
            <div className="relative aspect-[4/5] bg-sand">
              <img src={img.url} alt={img.alt || ''} className="absolute inset-0 h-full w-full object-cover" />
              {i === 0 && (
                <span className="absolute left-2 top-2 inline-flex items-center gap-1 rounded-full bg-ink px-2 py-0.5 text-[11px] font-medium text-ivory">
                  <Star className="h-3 w-3 fill-current" /> Primary
                </span>
              )}
              <div className="absolute inset-x-2 bottom-2 flex items-center justify-between gap-1 rounded-full bg-white/95 p-1 shadow-sm backdrop-blur">
                <button type="button" onClick={() => move(i, i - 1)} disabled={i === 0} className="grid h-7 w-7 place-items-center rounded-full hover:bg-ink/5 disabled:opacity-30" aria-label="Move left">
                  <ArrowLeft className="h-3.5 w-3.5" />
                </button>
                {i !== 0 ? (
                  <button type="button" onClick={() => move(i, 0)} className="rounded-full px-2 text-[11px] font-medium hover:bg-ink/5" aria-label="Make primary">
                    Make primary
                  </button>
                ) : (
                  <span className="text-[11px] text-mute">#{i + 1}</span>
                )}
                <button type="button" onClick={() => move(i, i + 1)} disabled={i === images.length - 1} className="grid h-7 w-7 place-items-center rounded-full hover:bg-ink/5 disabled:opacity-30" aria-label="Move right">
                  <ArrowRight className="h-3.5 w-3.5" />
                </button>
              </div>
              <button
                type="button"
                onClick={() => remove(i)}
                className="absolute right-2 top-2 grid h-7 w-7 place-items-center rounded-full bg-white/95 text-danger shadow-sm hover:bg-white"
                aria-label="Remove image"
              >
                <Trash2 className="h-3.5 w-3.5" />
              </button>
            </div>
            <input
              type="text"
              value={img.alt || ''}
              onChange={(e) => setAlt(i, e.target.value)}
              placeholder="Alt text"
              className="w-full border-t border-line px-3 py-2 text-xs outline-none placeholder:text-mute/70 focus:bg-ivory"
            />
          </div>
        ))}

        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          onDragOver={(e) => {
            e.preventDefault();
            setDragOver(true);
          }}
          onDragLeave={() => setDragOver(false)}
          onDrop={(e) => {
            e.preventDefault();
            setDragOver(false);
            addFiles(e.dataTransfer.files);
          }}
          className={cn(
            'flex aspect-[4/5] flex-col items-center justify-center gap-2 rounded-2xl border border-dashed text-center text-xs text-mute transition-colors',
            dragOver ? 'border-brand bg-champagne/30' : 'border-line bg-ivory hover:border-ink/40'
          )}
        >
          {busy ? <Loader2 className="h-5 w-5 animate-spin" /> : <ImagePlus className="h-5 w-5" />}
          <span className="font-medium text-ink">{busy ? `Uploading ${busy}…` : 'Add images'}</span>
          <span className="px-3">Drop files or click · JPG, PNG, WEBP up to 10 MB</span>
        </button>
      </div>

      <div className="flex gap-2">
        <div className="relative flex-1">
          <Link2 className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-mute" />
          <input
            type="text"
            inputMode="url"
            value={urlDraft}
            onChange={(e) => setUrlDraft(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                addUrl();
              }
            }}
            placeholder="…or paste an image URL"
            className="field !rounded-xl !py-2.5 !pl-10 !text-sm"
          />
        </div>
        <Button type="button" variant="outline" size="sm" className="h-auto" onClick={addUrl} disabled={!urlDraft.trim()}>
          Add URL
        </Button>
      </div>
      <p className="text-xs text-mute">The first image is the primary image shown on product cards and in search.</p>

      <input ref={inputRef} type="file" accept={ACCEPT} multiple hidden onChange={(e) => addFiles(e.target.files)} />
    </div>
  );
}
