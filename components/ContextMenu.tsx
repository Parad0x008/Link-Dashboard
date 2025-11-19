
import React, { useEffect, useRef } from 'react';
import { Edit2, Trash2, Copy, RotateCcw, ExternalLink } from 'lucide-react';
import { ContextMenuState } from '../types';

interface ContextMenuProps {
  state: ContextMenuState;
  onClose: () => void;
  onEdit: () => void;
  onDelete: () => void;
  onResetStats: () => void;
  onCopyUrl: () => void;
  onOpenNewTab: () => void;
}

export const ContextMenu: React.FC<ContextMenuProps> = ({
  state,
  onClose,
  onEdit,
  onDelete,
  onResetStats,
  onCopyUrl,
  onOpenNewTab
}) => {
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        onClose();
      }
    };
    // Close on scroll as well to prevent floating menu
    const handleScroll = () => onClose();

    document.addEventListener('mousedown', handleClickOutside);
    window.addEventListener('scroll', handleScroll);
    
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      window.removeEventListener('scroll', handleScroll);
    };
  }, [onClose]);

  if (!state.visible) return null;

  return (
    <div
      ref={menuRef}
      className="fixed z-[100] w-48 bg-white/90 dark:bg-[#1e1e1e]/90 backdrop-blur-md border border-gray-200 dark:border-gray-700 rounded-xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-100"
      style={{ top: state.y, left: state.x }}
      onContextMenu={(e) => e.preventDefault()}
    >
      <div className="p-1.5 space-y-0.5">
        <button onClick={onOpenNewTab} className="w-full flex items-center gap-2 px-2 py-1.5 text-sm text-gray-700 dark:text-gray-200 hover:bg-primary/10 hover:text-primary rounded-md transition-colors text-left">
          <ExternalLink size={14} />
          <span>Open</span>
        </button>
        <button onClick={onCopyUrl} className="w-full flex items-center gap-2 px-2 py-1.5 text-sm text-gray-700 dark:text-gray-200 hover:bg-primary/10 hover:text-primary rounded-md transition-colors text-left">
          <Copy size={14} />
          <span>Copy URL</span>
        </button>
        <div className="h-px bg-gray-200 dark:bg-gray-700 my-1" />
        <button onClick={onEdit} className="w-full flex items-center gap-2 px-2 py-1.5 text-sm text-gray-700 dark:text-gray-200 hover:bg-primary/10 hover:text-primary rounded-md transition-colors text-left">
          <Edit2 size={14} />
          <span>Edit</span>
        </button>
        <button onClick={onResetStats} className="w-full flex items-center gap-2 px-2 py-1.5 text-sm text-gray-700 dark:text-gray-200 hover:bg-primary/10 hover:text-primary rounded-md transition-colors text-left">
          <RotateCcw size={14} />
          <span>Reset Clicks</span>
        </button>
        <div className="h-px bg-gray-200 dark:bg-gray-700 my-1" />
        <button onClick={onDelete} className="w-full flex items-center gap-2 px-2 py-1.5 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-md transition-colors text-left">
          <Trash2 size={14} />
          <span>Delete</span>
        </button>
      </div>
    </div>
  );
};
