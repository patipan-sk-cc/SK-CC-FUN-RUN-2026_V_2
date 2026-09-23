import React, { useState, useEffect } from 'react';
import { X, ZoomIn, ZoomOut, RotateCcw, Download } from 'lucide-react';

interface ImageZoomModalProps {
  isOpen: boolean;
  onClose: () => void;
  imageUrl: string;
  title: string;
  caption?: string;
}

export const ImageZoomModal: React.FC<ImageZoomModalProps> = ({
  isOpen,
  onClose,
  imageUrl,
  title,
  caption,
}) => {
  const [zoomLevel, setZoomLevel] = useState<number>(1);

  useEffect(() => {
    if (isOpen) {
      setZoomLevel(1);
      // Prevent body scroll when modal is open
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  if (!isOpen || !imageUrl) return null;

  const handleZoomIn = () => setZoomLevel((prev) => Math.min(prev + 0.25, 3));
  const handleZoomOut = () => setZoomLevel((prev) => Math.max(prev - 0.25, 0.5));
  const handleResetZoom = () => setZoomLevel(1);

  return (
    <div
      id="image-zoom-modal-backdrop"
      className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-slate-900/85 backdrop-blur-sm p-4 sm:p-6 animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        id="image-zoom-modal-card"
        className="relative flex flex-col bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[92vh] overflow-hidden border border-slate-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 bg-[#0F4E7A] text-white">
          <div>
            <h3 className="text-lg font-semibold tracking-wide">{title}</h3>
            {caption && <p className="text-xs text-amber-200 mt-0.5">{caption}</p>}
          </div>
          <div className="flex items-center gap-2">
            <div className="flex items-center bg-white/10 rounded-lg p-1 border border-white/20">
              <button
                id="btn-zoom-out"
                type="button"
                onClick={handleZoomOut}
                disabled={zoomLevel <= 0.5}
                title="ซูมออก (-)"
                className="p-1.5 text-white hover:bg-white/20 disabled:opacity-40 rounded transition"
              >
                <ZoomOut className="w-4 h-4" />
              </button>
              <span className="px-2 text-xs font-mono font-medium">
                {Math.round(zoomLevel * 100)}%
              </span>
              <button
                id="btn-zoom-in"
                type="button"
                onClick={handleZoomIn}
                disabled={zoomLevel >= 3}
                title="ซูมเข้า (+)"
                className="p-1.5 text-white hover:bg-white/20 disabled:opacity-40 rounded transition"
              >
                <ZoomIn className="w-4 h-4" />
              </button>
              <button
                id="btn-zoom-reset"
                type="button"
                onClick={handleResetZoom}
                title="รีเซ็ตขนาดเดิม"
                className="p-1.5 text-white hover:bg-white/20 rounded transition ml-1"
              >
                <RotateCcw className="w-3.5 h-3.5" />
              </button>
            </div>
            {imageUrl && (
              <a
                href={imageUrl}
                download={`SKCC_${title.replace(/\s+/g, '_')}.png`}
                title="ดาวน์โหลดรูปภาพ"
                className="p-2 text-white/90 hover:text-white hover:bg-white/20 rounded-lg transition"
              >
                <Download className="w-4 h-4" />
              </a>
            )}
            <button
              id="btn-close-zoom-modal"
              type="button"
              onClick={onClose}
              className="p-2 text-white/90 hover:text-white hover:bg-white/20 rounded-lg transition ml-1"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Body / Image Viewport */}
        <div className="relative flex-1 overflow-auto p-4 sm:p-8 bg-slate-100 flex items-center justify-center min-h-[360px]">
          <div
            className="transition-transform duration-200 ease-out origin-center flex items-center justify-center"
            style={{ transform: `scale(${zoomLevel})` }}
          >
            <img
              src={imageUrl}
              alt={title}
              className="max-h-[68vh] w-auto object-contain rounded-lg shadow-md select-none pointer-events-auto"
            />
          </div>
        </div>

        {/* Modal Footer Controls info */}
        <div className="px-6 py-2.5 bg-slate-50 border-t border-slate-200 text-xs text-slate-500 flex items-center justify-between">
          <span>คลิกปุ่มซูมด้านบนเพื่อขยายดูรายละเอียด หรือเลื่อนเมาส์เพื่อดูภาพทั้งหมด</span>
          <button
            type="button"
            onClick={onClose}
            className="px-3 py-1 bg-slate-200 hover:bg-slate-300 text-slate-700 rounded-md font-medium text-xs transition"
          >
            ปิดหน้าต่าง
          </button>
        </div>
      </div>
    </div>
  );
};
