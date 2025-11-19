
import React from 'react';
import { useDroppable } from '@dnd-kit/core';
import { SortableContext, rectSortingStrategy } from '@dnd-kit/sortable';
import { Plus, Trash2, Folder, Rocket } from 'lucide-react';
import { Category, LinkItem } from '../types';
import { LinkCard } from './LinkCard';

interface CategorySectionProps {
  category: Category;
  links: LinkItem[];
  isEditMode: boolean;
  onAddLink: (categoryId: string) => void;
  onEditLink: (link: LinkItem) => void;
  onDeleteLink: (id: string) => void;
  onDeleteCategory: (id: string) => void;
  onRenameCategory: (id: string, title: string) => void;
  onLinkClick: (id: string) => void;
  onContextMenu: (e: React.MouseEvent, linkId: string) => void;
}

export const CategorySection: React.FC<CategorySectionProps> = ({
  category,
  links,
  isEditMode,
  onAddLink,
  onEditLink,
  onDeleteLink,
  onDeleteCategory,
  onRenameCategory,
  onLinkClick,
  onContextMenu
}) => {
  const { setNodeRef, isOver } = useDroppable({
    id: category.id,
    data: {
        type: 'CATEGORY',
        item: category
    }
  });

  const handleOpenAll = () => {
    if (confirm(`Open all ${links.length} links in "${category.title}"?`)) {
        links.forEach(link => {
            window.open(link.url, '_blank');
        });
    }
  };

  return (
    <div className="mb-8 animate-fade-in">
      <div className="flex items-center justify-between mb-4 group/header px-2">
        <div className="flex items-center gap-3 flex-1">
            {/* Icon decoration */}
            <div className="text-gray-300 dark:text-gray-600">
                <Folder size={20} />
            </div>

            {isEditMode ? (
                <input
                    type="text"
                    value={category.title}
                    onChange={(e) => onRenameCategory(category.id, e.target.value)}
                    className="text-xl font-bold text-gray-800 dark:text-gray-100 bg-transparent border-b border-dashed border-gray-300 dark:border-gray-700 focus:border-primary focus:outline-none px-1 w-full max-w-xs transition-colors"
                    placeholder="Category Name"
                />
            ) : (
                <h2 className="text-xl font-bold text-gray-800 dark:text-gray-100 tracking-tight">
                    {category.title}
                </h2>
            )}
            
            {!isEditMode && (
                <span className="text-xs font-medium text-gray-400 dark:text-gray-500 bg-gray-100 dark:bg-gray-800/50 px-2 py-0.5 rounded-full shrink-0 border border-gray-200 dark:border-gray-700">
                    {links.length}
                </span>
            )}

            {!isEditMode && links.length > 0 && (
                <button
                    onClick={handleOpenAll}
                    className="ml-2 p-1.5 rounded-lg text-gray-400 hover:text-primary hover:bg-primary/5 transition-all opacity-0 group-hover/header:opacity-100"
                    title="Open All Links"
                >
                    <Rocket size={16} />
                </button>
            )}
        </div>
        
        {isEditMode && (
            <button 
                onClick={(e) => {
                    e.stopPropagation();
                    onDeleteCategory(category.id);
                }}
                className="p-2 text-gray-400 hover:text-red-500 transition-colors hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg z-50 relative"
                title="Delete Category"
            >
                <Trash2 size={18} />
            </button>
        )}
      </div>

      <div 
        ref={setNodeRef} 
        className={`
            rounded-3xl p-6 min-h-[140px] transition-colors duration-300
            ${isOver ? 'bg-primary/5 border-primary/30' : 'bg-gray-50/50 dark:bg-[#121212] border-gray-200 dark:border-gray-800'}
            border border-dashed
        `}
      >
        <SortableContext items={links.map(l => l.id)} strategy={rectSortingStrategy}>
          <div className="flex flex-wrap gap-4">
            {links.map((link) => (
              <LinkCard
                key={link.id}
                link={link}
                isEditMode={isEditMode}
                onEdit={onEditLink}
                onDelete={onDeleteLink}
                onLinkClick={onLinkClick}
                onContextMenu={onContextMenu}
              />
            ))}
            
            {/* Add Link Button Card */}
            <button
              onClick={() => onAddLink(category.id)}
              className={`
                flex flex-col items-center justify-center 
                w-32 h-32 rounded-2xl border-2 border-dashed 
                text-gray-400 dark:text-gray-600
                transition-all duration-200 group
                ${isEditMode 
                    ? 'border-primary/40 text-primary/60 bg-primary/5 hover:bg-primary/10' 
                    : 'border-gray-300 dark:border-gray-800 hover:border-primary/50 hover:text-primary hover:bg-white dark:hover:bg-white/5'}
              `}
              title="Add New Link"
            >
              <div className="w-10 h-10 rounded-full bg-transparent group-hover:bg-primary/10 dark:group-hover:bg-primary/20 flex items-center justify-center mb-2 transition-colors">
                <Plus size={24} className="group-hover:scale-110 transition-transform" />
              </div>
              <span className="text-xs font-bold uppercase tracking-wide">Add Link</span>
            </button>
          </div>
        </SortableContext>
        
        {links.length === 0 && (
            <div className="w-full py-4 text-center text-gray-400 dark:text-gray-600 text-xs italic opacity-70">
                Empty category
            </div>
        )}
      </div>
    </div>
  );
};
