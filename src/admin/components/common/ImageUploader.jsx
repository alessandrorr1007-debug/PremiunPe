import React, { useState, useRef } from 'react';
import { UploadCloud, Trash2, CheckCircle2 } from 'lucide-react';
import { toast } from 'sonner';

export default function ImageUploader({ value, onChange, onFileSelect, disabled }) {
  const [dragOver, setDragOver] = useState(false);
  const [manualUrl, setManualUrl] = useState('');
  const [showManualInput, setShowManualInput] = useState(false);
  const fileInputRef = useRef(null);

  const MAX_FILE_SIZE_BYTES = 2 * 1024 * 1024; // 2 MB

  const processFile = (file) => {
    if (!file || disabled) return;

    // Validación de tipo
    const validTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
    if (!validTypes.includes(file.type)) {
      toast.error('Formato no soportado. Usa JPEG, PNG, WebP o GIF.');
      return;
    }

    // Validación de tamaño (máx 2MB)
    if (file.size > MAX_FILE_SIZE_BYTES) {
      toast.error('La imagen supera el límite máximo de 2 MB.');
      return;
    }

    onFileSelect(file);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      processFile(e.target.files[0]);
    }
  };

  const handleRemove = (e) => {
    e.stopPropagation();
    onChange('');
    if (fileInputRef.current) fileInputRef.current.value = '';
    toast.info('Guarda los cambios para quitar la imagen del catálogo.');
  };

  const handleApplyManualUrl = () => {
    if (!manualUrl.trim()) return;
    onChange(manualUrl.trim());
    setShowManualInput(false);
    setManualUrl('');
    toast.success('URL de imagen aplicada');
  };

  return (
    <div className="space-y-3">
      {/* Área de arrastrar y soltar / vista previa */}
      {value ? (
        <div className="relative rounded-2xl bg-night border border-borderCream p-3 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-16 h-16 rounded-xl bg-white/[0.05] border border-borderCream overflow-hidden shrink-0">
              <img
                src={value}
                alt="Vista previa"
                className="w-full h-full object-cover"
              />
            </div>
            <div className="min-w-0">
              <span className="text-xs font-semibold text-cream truncate block font-sora">
                Imagen activa
              </span>
              <span className="text-[11px] text-lime flex items-center gap-1 mt-0.5">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Lista para mostrar en catálogo</span>
              </span>
            </div>
          </div>

          <button
            type="button"
            onClick={handleRemove}
            disabled={disabled}
            className="p-2.5 rounded-xl bg-rocoto/10 hover:bg-rocoto/20 border border-rocoto/20 text-rocoto transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center"
            title="Quitar imagen"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      ) : (
        <div
          onDragOver={(e) => {
            e.preventDefault();
            setDragOver(true);
          }}
          onDragLeave={() => setDragOver(false)}
          onDrop={handleDrop}
          onClick={() => !disabled && fileInputRef.current?.click()}
          className={`relative rounded-2xl border-2 border-dashed p-6 text-center cursor-pointer transition-all ${
            dragOver
              ? 'border-aji bg-aji/10'
              : 'border-borderCream hover:border-cream/30 bg-night/50'
          }`}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp,image/gif"
            onChange={handleFileChange}
            disabled={disabled}
            className="hidden"
          />

          <div className="w-12 h-12 rounded-2xl bg-white/[0.04] border border-borderCream flex items-center justify-center text-muted mx-auto mb-3">
            <UploadCloud className="w-6 h-6 text-aji" />
          </div>

          <p className="text-xs sm:text-sm font-semibold text-cream font-sora">
            Arrastra tu imagen aquí o <span className="text-aji underline">examina</span>
          </p>
          <p className="text-[11px] text-muted mt-1 font-sans">
            PNG, JPG, WebP o GIF (máximo 2 MB)
          </p>
        </div>
      )}

      {/* Opción de URL manual alternativa */}
      <div className="flex items-center justify-between text-xs pt-1">
        <button
          type="button"
          onClick={() => setShowManualInput(!showManualInput)}
          className="text-muted hover:text-aji transition-colors text-[11px] underline"
        >
          {showManualInput ? 'Ocultar ingreso por URL' : 'O ingresar enlace directo (URL)...'}
        </button>
      </div>

      {showManualInput && (
        <div className="flex items-center gap-2 pt-1 animate-fadeIn">
          <input
            type="url"
            value={manualUrl}
            onChange={(e) => setManualUrl(e.target.value)}
            placeholder="https://ejemplo.com/imagen.png"
            className="flex-1 px-3 py-2.5 rounded-xl bg-night border border-borderCream text-xs text-cream placeholder-muted/60 focus:outline-none focus:ring-1 focus:ring-aji"
          />
          <button
            type="button"
            onClick={handleApplyManualUrl}
            disabled={disabled}
            className="px-4 py-2.5 rounded-xl bg-white/[0.06] hover:bg-white/[0.1] text-xs font-semibold text-cream transition-colors min-h-[44px]"
          >
            Aplicar
          </button>
        </div>
      )}
    </div>
  );
}
