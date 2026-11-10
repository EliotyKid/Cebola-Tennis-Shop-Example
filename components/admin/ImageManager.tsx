'use client';

import { ChevronLeft, ChevronRight, ImagePlus, Trash2 } from 'lucide-react';
import { useRef, useState } from 'react';
import { SafeImage } from '@/components/SafeImage';
import { compressImage } from '@/lib/admin/compress';
import { BUCKET, moveItem, publicBase, validateImageFile } from '@/lib/admin/images';
import { createBrowserSupabase } from '@/lib/supabase/browser';

export function ImageManager({ images, onChange, folder, max, onBusy }: {
  images: string[]; onChange: (images: string[]) => void; folder: 'products' | 'categories'; max?: number; onBusy?: (busy: boolean) => void;
}) {
  const [uploading, setUploading] = useState(0);
  const [errors, setErrors] = useState<string[]>([]);
  // Files added in this visit are not saved anywhere yet, so removing one must delete it right away.
  const fresh = useRef(new Set<string>());
  const current = useRef(images);
  current.current = images;

  const upload = async (files: File[]) => {
    const room = max === undefined ? files.length : Math.max(0, max - images.length);
    const accepted = files.slice(0, room);
    setErrors([]);
    setUploading(accepted.length);
    onBusy?.(true);
    const supabase = createBrowserSupabase();
    for (const file of accepted) {
      const problem = validateImageFile(file);
      try {
        if (problem) throw new Error(problem);
        const blob = await compressImage(file);
        const path = `${folder}/${crypto.randomUUID()}.${blob.type === 'image/webp' ? 'webp' : 'jpg'}`;
        const { error } = await supabase.storage.from(BUCKET).upload(path, blob, { contentType: blob.type });
        if (error) throw new Error('não foi possível enviar. Tente novamente.');
        const url = `${publicBase()}${path}`;
        fresh.current.add(url);
        current.current = [...current.current, url];
        onChange(current.current);
      } catch (e) {
        const reason = problem ?? (e instanceof Error && e.message.startsWith('não') ? e.message : 'arquivo de imagem inválido.');
        setErrors(list => [...list, `${file.name}: ${reason}`]);
      }
      setUploading(n => n - 1);
    }
    onBusy?.(false);
  };

  const remove = (url: string) => {
    onChange(images.filter(i => i !== url));
    if (fresh.current.delete(url)) void createBrowserSupabase().storage.from(BUCKET).remove([url.slice(publicBase().length)]);
  };

  return (
    <div className="adm-images">
      <ul className="adm-images__grid">
        {images.map((url, i) => (
          <li key={url} className="adm-images__item">
            <SafeImage src={url} alt={`Imagem ${i + 1}`} />
            {i === 0 && max !== 1 ? <span className="adm-images__cover">Capa</span> : null}
            <div className="adm-images__tools">
              {max !== 1 ? (
                <>
                  <button type="button" aria-label={`Mover imagem ${i + 1} para a esquerda`} disabled={i === 0} onClick={() => onChange(moveItem(images, i, i - 1))}><ChevronLeft size={16} /></button>
                  <button type="button" aria-label={`Mover imagem ${i + 1} para a direita`} disabled={i === images.length - 1} onClick={() => onChange(moveItem(images, i, i + 1))}><ChevronRight size={16} /></button>
                </>
              ) : null}
              <button type="button" aria-label={`Remover imagem ${i + 1}`} onClick={() => remove(url)}><Trash2 size={16} /></button>
            </div>
          </li>
        ))}
        {max === undefined || images.length < max ? (
          <li>
            <label className={`adm-images__add${uploading ? ' is-busy' : ''}`}>
              <input
                type="file" accept="image/jpeg,image/png,image/webp" multiple={max !== 1} disabled={uploading > 0}
                onChange={e => { const files = [...(e.target.files ?? [])]; e.target.value = ''; void upload(files); }}
              />
              <ImagePlus size={22} strokeWidth={1.5} />
              <span aria-live="polite">{uploading ? `Enviando ${uploading}...` : 'Adicionar imagem'}</span>
            </label>
          </li>
        ) : null}
      </ul>
      {errors.map(e => <p key={e} className="adm-alert adm-alert--error" role="alert">{e}</p>)}
    </div>
  );
}
