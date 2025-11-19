
import React from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { ExternalLink, Trash2, Edit2, GripVertical, Flame } from 'lucide-react';
import { LinkItem } from '../types';

interface LinkCardProps {
  link: LinkItem;
  isEditMode: boolean;
  onEdit: (link: LinkItem) => void;
  onDelete: (id: string) => void;
  onLinkClick: (id: string) => void;
  onContextMenu: (e: React.MouseEvent, linkId: string) => void;
}

export const LinkCard: React.FC<LinkCardProps> = ({ link, isEditMode, onEdit, onDelete, onLinkClick, onContextMenu }) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: link.id,
    data: {
      type: 'LINK',
      item: link,
    },
    disabled: !isEditMode, 
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
    zIndex: isDragging ? 50 : 'auto',
  };

  const handleCardClick = (e: React.MouseEvent) => {
    if (isEditMode) {
      e.preventDefault();
      e.stopPropagation();
      onEdit(link);
    } else {
        onLinkClick(link.id);
    }
  };

  const handleDelete = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    onDelete(link.id);
  }

  const isPopular = (link.clicks || 0) > 5;

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`
        group relative flex flex-col items-center justify-center 
        w-32 h-32 rounded-2xl transition-all duration-300 overflow-hidden
        ${isEditMode ? 'cursor-grab active:cursor-grabbing' : 'cursor-pointer hover:-translate-y-1.5 hover:shadow-xl hover:shadow-primary/10'}
        bg-white dark:bg-[#1a1a1a]/80 backdrop-blur-md border border-gray-200 dark:border-gray-800/60
        shadow-sm
      `}
      onClick={handleCardClick}
      onContextMenu={(e) => onContextMenu(e, link.id)}
    >
      {/* Gradient Overlay on Hover */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-primary/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />

      {/* Popular Badge */}
      {!isEditMode && isPopular && (
        <div className="absolute top-2 right-2 text-orange-500 animate-pulse" title="Popular Link">
            <Flame size={14} fill="currentColor" />
        </div>
      )}

      {/* Drag Handle */}
      {isEditMode && (
        <div 
            {...attributes} 
            {...listeners} 
            className="absolute top-2 left-2 text-gray-400 hover:text-primary z-40 p-1 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors cursor-grab active:cursor-grabbing"
            onClick={(e) => e.stopPropagation()}
        >
          <GripVertical size={16} />
        </div>
      )}

      {/* Delete Button */}
      {isEditMode && (
        <button
          onPointerDown={(e) => e.stopPropagation()}
          onClick={handleDelete}
          className="absolute top-2 right-2 p-1.5 rounded-full bg-red-50 text-red-500 hover:bg-red-500 hover:text-white transition-colors z-50 shadow-sm border border-red-100 dark:bg-red-500/10 dark:border-transparent dark:hover:bg-red-500 cursor-pointer"
          title="Delete Link"
        >
          <Trash2 size={14} />
        </button>
      )}

      {/* Content */}
      <a
        href={link.url}
        target="_blank"
        rel="noopener noreferrer"
        className="flex flex-col items-center justify-center w-full h-full z-10 p-4"
        onClick={(e) => {
            if(isEditMode) e.preventDefault();
        }}
      >
        <div className="relative w-12 h-12 mb-3 rounded-xl overflow-hidden bg-gray-50 dark:bg-gray-800/80 flex items-center justify-center shadow-inner group-hover:scale-110 transition-transform duration-300">
          {link.iconDataUrl ? (
            <img src={link.iconDataUrl} alt={link.title} className="w-full h-full object-cover" />
          ) : (
            <div className="text-gray-300 dark:text-gray-600 group-hover:text-primary/70 transition-colors">
                <ExternalLink size={24} />
            </div>
          )}
        </div>
        <span className="text-sm font-semibold text-center text-gray-700 dark:text-gray-200 truncate w-full px-1 group-hover:text-primary transition-colors">
          {link.title}
        </span>
      </a>

       {/* Edit Overlay */}
       {isEditMode && (
        <div className="absolute inset-0 flex items-center justify-center bg-white/60 dark:bg-black/60 backdrop-blur-[2px] opacity-0 hover:opacity-100 transition-all duration-200 z-20 pointer-events-none">
             <div className="bg-primary text-white p-2 rounded-full shadow-lg transform scale-75 group-hover:scale-100 transition-transform">
                <Edit2 size={20} />
             </div>
        </div>
       )}
    </div>
  );
};
