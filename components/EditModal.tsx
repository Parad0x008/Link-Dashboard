import React, { useState, useEffect, useRef } from 'react';
import { X, Upload, Image as ImageIcon, Globe, Wand2, Plus } from 'lucide-react';
import { LinkItem, Category } from '../types';

interface EditModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (linkData: Partial<LinkItem>) => void;
  initialData?: Partial<LinkItem>;
  categories: Category[];
  preselectedCategoryId?: string;
}

export const EditModal: React.FC<EditModalProps> = ({
  isOpen,
  onClose,
  onSave,
  initialData,
  categories,
  preselectedCategoryId,
}) => {
  const [title, setTitle] = useState('');
  const [url, setUrl] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [iconDataUrl, setIconDataUrl] = useState<string | undefined>(undefined);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setTitle(initialData?.title || '');
      setUrl(initialData?.url || '');
      setCategoryId(initialData?.categoryId || preselectedCategoryId || (categories[0]?.id || ''));
      setIconDataUrl(initialData?.iconDataUrl);
    }
  }, [isOpen, initialData, preselectedCategoryId, categories]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setIconDataUrl(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleFetchFavicon = () => {
    if (!url) return;
    try {
        // Ensure protocol
        const urlObj = new URL(url.startsWith('http') ? url : `https://${url}`);
        const domain = urlObj.hostname;
        // Use Google's favicon service
        const faviconUrl = `https://www.google.com/s2/favicons?domain=${domain}&sz=128`;
        setIconDataUrl(faviconUrl);
        
        // Auto-fill title if empty
        if (!title) {
            setTitle(domain.split('.')[0].charAt(0).toUpperCase() + domain.split('.')[0].slice(1));
        }
    } catch (e) {
        alert('Please enter a valid URL first.');
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Basic URL validation
    let formattedUrl = url;
    if (!/^https?:\/\//i.test(url) && url) {
        formattedUrl = `https://${url}`;
    }

    onSave({
      id: initialData?.id,
      title,
      url: formattedUrl,
      categoryId,
      iconDataUrl,
    });
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
      <div className="w-full max-w-md bg-white dark:bg-[#1a1a1a] rounded-3xl shadow-2xl border border-gray-200 dark:border-gray-800 overflow-hidden transform transition-all scale-100">
        <div className="px-6 py-4 border-b border-gray-100 dark:border-gray-800 flex justify-between items-center bg-gray-50/80 dark:bg-white/5 backdrop-blur-sm">
          <h3 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
            {initialData?.id ? <Wand2 size={18} className="text-primary" /> : <Plus size={18} className="text-primary" />}
            {initialData?.id ? 'Edit Link' : 'Add New Link'}
          </h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors p-1 hover:bg-gray-200 dark:hover:bg-white/10 rounded-full">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Icon Section */}
          <div className="flex flex-col items-center gap-4">
            <div className="relative group">
                <div 
                    onClick={() => fileInputRef.current?.click()}
                    className="w-24 h-24 rounded-2xl border-2 border-dashed border-gray-300 dark:border-gray-700 flex flex-col items-center justify-center cursor-pointer hover:border-primary hover:bg-gray-50 dark:hover:bg-white/5 transition-all overflow-hidden bg-gray-50 dark:bg-black/40 shadow-inner"
                >
                    {iconDataUrl ? (
                        <img src={iconDataUrl} alt="Preview" className="w-full h-full object-cover" />
                    ) : (
                        <>
                            <ImageIcon className="text-gray-400 mb-1 group-hover:text-primary" size={24} />
                            <span className="text-[10px] font-medium text-gray-400 group-hover:text-primary uppercase tracking-wide">Upload</span>
                        </>
                    )}
                </div>
                <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="absolute -bottom-2 -right-2 p-1.5 bg-primary text-white rounded-full shadow-lg hover:bg-primary-hover transition-colors"
                    title="Upload Image"
                >
                    <Upload size={14} />
                </button>
                <input 
                    ref={fileInputRef} 
                    type="file" 
                    accept="image/*" 
                    className="hidden" 
                    onChange={handleFileChange}
                />
            </div>
          </div>

          {/* Inputs */}
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-1.5">URL</label>
              <div className="relative group">
                <input
                    type="text"
                    required
                    value={url}
                    onChange={(e) => setUrl(e.target.value)}
                    onBlur={() => {
                        // Optional: auto-fetch on blur if empty
                    }}
                    placeholder="example.com"
                    className="w-full pl-4 pr-10 py-3 rounded-xl bg-gray-100 dark:bg-gray-800/50 border border-transparent focus:bg-white dark:focus:bg-black focus:border-primary focus:ring-4 focus:ring-primary/10 focus:outline-none text-gray-900 dark:text-white transition-all shadow-sm"
                />
                <div className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
                    <Globe size={18} />
                </div>
              </div>
              {url && !iconDataUrl && (
                <div className="mt-2 text-right">
                    <button 
                        type="button"
                        onClick={handleFetchFavicon}
                        className="text-xs font-bold text-primary hover:text-primary-hover hover:underline flex items-center gap-1 ml-auto bg-primary/10 px-2 py-1 rounded-md transition-colors"
                    >
                        <Globe size={12} />
                        Auto-fetch icon
                    </button>
                </div>
            )}
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-1.5">Title</label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="My Link"
                className="w-full px-4 py-3 rounded-xl bg-gray-100 dark:bg-gray-800/50 border border-transparent focus:bg-white dark:focus:bg-black focus:border-primary focus:ring-4 focus:ring-primary/10 focus:outline-none text-gray-900 dark:text-white transition-all shadow-sm"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-1.5">Category</label>
              <div className="relative">
                  <select
                    value={categoryId}
                    onChange={(e) => setCategoryId(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl bg-gray-100 dark:bg-gray-800/50 border border-transparent focus:bg-white dark:focus:bg-black focus:border-primary focus:ring-4 focus:ring-primary/10 focus:outline-none text-gray-900 dark:text-white transition-all appearance-none shadow-sm"
                  >
                    {categories.map(c => (
                        <option key={c.id} value={c.id}>{c.title}</option>
                    ))}
                  </select>
                  <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-gray-500">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                  </div>
              </div>
            </div>
          </div>

          <div className="pt-4 flex gap-3">
            <button
                type="button"
                onClick={onClose}
                className="flex-1 px-4 py-3 rounded-xl font-bold text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
            >
                Cancel
            </button>
            <button
                type="submit"
                className="flex-1 px-4 py-3 rounded-xl font-bold text-white bg-gradient-to-r from-primary to-purple-600 hover:to-purple-700 shadow-lg shadow-primary/25 transition-all transform hover:scale-[1.02] active:scale-95"
            >
                Save Link
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};