
import React, { useState, useEffect, useRef } from 'react';
import { 
  DndContext, 
  closestCenter, 
  KeyboardSensor, 
  PointerSensor, 
  useSensor, 
  useSensors, 
  DragOverlay,
  DragEndEvent,
  DragStartEvent,
  DragOverEvent
} from '@dnd-kit/core';
import { 
  arrayMove, 
  sortableKeyboardCoordinates 
} from '@dnd-kit/sortable';
import { Sun, Moon, Layout, Plus, Settings, LogIn, Download, Upload as UploadIcon, Save, Search, X, Palette, LayoutPanelLeft, Command } from 'lucide-react';
import { Category, LinkItem, Theme, CustomTheme, ContextMenuState } from './types';
import { CategorySection } from './components/CategorySection';
import { LinkCard } from './components/LinkCard';
import { EditModal } from './components/EditModal';
import { StyleModal } from './components/StyleModal';
import { Widgets } from './components/Widgets';
import { ContextMenu } from './components/ContextMenu';
import { InteractiveBackground } from './components/InteractiveBackground';

// Initial Mock Data
const DEFAULT_CATEGORIES: Category[] = [
  { id: 'cat_1', title: 'Productivity' },
  { id: 'cat_2', title: 'Entertainment' },
];

const DEFAULT_LINKS: LinkItem[] = [
  { id: 'link_1', title: 'Gmail', url: 'https://mail.google.com', categoryId: 'cat_1', iconDataUrl: '', clicks: 12 },
  { id: 'link_2', title: 'GitHub', url: 'https://github.com', categoryId: 'cat_1', iconDataUrl: '', clicks: 8 },
  { id: 'link_3', title: 'YouTube', url: 'https://youtube.com', categoryId: 'cat_2', iconDataUrl: '', clicks: 25 },
];

function App() {
  // --- State ---
  const [categories, setCategories] = useState<Category[]>(() => {
    const saved = localStorage.getItem('dashboard_categories');
    return saved ? JSON.parse(saved) : DEFAULT_CATEGORIES;
  });
  
  const [links, setLinks] = useState<LinkItem[]>(() => {
    const saved = localStorage.getItem('dashboard_links');
    return saved ? JSON.parse(saved) : DEFAULT_LINKS;
  });

  const [theme, setTheme] = useState<Theme>(() => {
    if (typeof window !== 'undefined') {
      return document.documentElement.classList.contains('dark') ? 'dark' : 'light';
    }
    return 'dark'; // Default to dark
  });

  const [customTheme, setCustomTheme] = useState<CustomTheme>(() => {
    const saved = localStorage.getItem('dashboard_theme_custom');
    return saved ? JSON.parse(saved) : { 
        primaryColor: '#7c3aed', 
        fontFamily: 'Inter',
        backgroundImage: '',
        backgroundOverlayOpacity: 80
    };
  });

  const [dashboardTitle, setDashboardTitle] = useState(() => {
    return localStorage.getItem('dashboard_title') || 'The Nexus';
  });

  const [dashboardSubtitle, setDashboardSubtitle] = useState(() => {
    return localStorage.getItem('dashboard_subtitle') || 'Gateway to the digital realm';
  });

  const [isEditMode, setIsEditMode] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [styleModalOpen, setStyleModalOpen] = useState(false);
  const [activeDragId, setActiveDragId] = useState<string | null>(null);
  const [editingLink, setEditingLink] = useState<Partial<LinkItem> | undefined>(undefined);
  const [targetCategoryId, setTargetCategoryId] = useState<string | undefined>(undefined);
  const [searchQuery, setSearchQuery] = useState('');
  const [showWidgets, setShowWidgets] = useState(() => localStorage.getItem('dashboard_widgets') === 'true');
  
  const [contextMenu, setContextMenu] = useState<ContextMenuState>({
    visible: false,
    x: 0,
    y: 0,
    linkId: null,
  });

  const searchInputRef = useRef<HTMLInputElement>(null);

  // --- Effects ---
  useEffect(() => {
    // Theme management (Dark/Light)
    const root = document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
  }, [theme]);

  useEffect(() => {
    // Custom Theme Injection (Colors/Fonts)
    const root = document.documentElement;
    const hex = customTheme.primaryColor;
    
    // Helper to convert hex to rgb for tailwind alpha support
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    const rgb = `${r} ${g} ${b}`;
    
    // Darken for hover
    const hoverR = Math.max(0, r - 30);
    const hoverG = Math.max(0, g - 30);
    const hoverB = Math.max(0, b - 30);
    const rgbHover = `${hoverR} ${hoverG} ${hoverB}`;

    root.style.setProperty('--color-primary', rgb);
    root.style.setProperty('--color-primary-hover', rgbHover);
    root.style.setProperty('--font-family', customTheme.fontFamily);

    localStorage.setItem('dashboard_theme_custom', JSON.stringify(customTheme));
  }, [customTheme]);

  useEffect(() => {
    // Persistence
    localStorage.setItem('dashboard_categories', JSON.stringify(categories));
    localStorage.setItem('dashboard_links', JSON.stringify(links));
    localStorage.setItem('dashboard_title', dashboardTitle);
    localStorage.setItem('dashboard_subtitle', dashboardSubtitle);
    localStorage.setItem('dashboard_widgets', String(showWidgets));
  }, [categories, links, dashboardTitle, dashboardSubtitle, showWidgets]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Search Hotkey (Cmd+K)
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        searchInputRef.current?.focus();
      }
      // Close Context Menu on Esc
      if (e.key === 'Escape') {
        setContextMenu({ visible: false, x: 0, y: 0, linkId: null });
        setModalOpen(false);
        setStyleModalOpen(false);
      }
      // Power User Hotkeys
      if (e.altKey && e.key === 'n') {
          e.preventDefault();
          if (categories.length > 0) handleAddLink(categories[0].id);
          else handleAddCategory();
      }
      if (e.altKey && e.key === 'w') {
          e.preventDefault();
          setShowWidgets(prev => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [categories]);

  // --- Handlers ---
  const toggleTheme = () => setTheme(prev => prev === 'dark' ? 'light' : 'dark');

  const handleAddLink = (categoryId: string) => {
    setEditingLink(undefined);
    setTargetCategoryId(categoryId);
    setModalOpen(true);
  };

  const handleEditLink = (link: LinkItem) => {
    setEditingLink(link);
    setModalOpen(true);
  };

  const handleLinkClick = (id: string) => {
    setLinks(prev => prev.map(l => l.id === id ? { ...l, clicks: (l.clicks || 0) + 1 } : l));
  };

  const handleDeleteLink = (id: string) => {
    if (confirm('Are you sure you want to delete this link?')) {
        setLinks(prev => prev.filter(l => l.id !== id));
    }
  };

  const handleAddCategory = () => {
    const newCategory = { id: `cat_${Date.now()}`, title: 'New Category' };
    setCategories(prev => [...prev, newCategory]);
    if (!isEditMode) setIsEditMode(true);
    setTimeout(() => {
        window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' });
    }, 100);
  };

  const handleRenameCategory = (id: string, title: string) => {
    setCategories(prev => prev.map(c => c.id === id ? { ...c, title } : c));
  };

  const handleDeleteCategory = (id: string) => {
      if(confirm("Delete category and all its links?")) {
          setCategories(prev => prev.filter(c => c.id !== id));
          setLinks(prev => prev.filter(l => l.categoryId !== id));
      }
  }

  const handleSaveLink = (data: Partial<LinkItem>) => {
    if (data.id) {
      // Update
      setLinks(prev => prev.map(l => {
          if (l.id === data.id) {
              // Preserve clicks on update
              return { ...l, ...data, clicks: l.clicks } as LinkItem;
          }
          return l;
      }));
    } else {
      // Create
      const newLink: LinkItem = {
        id: `link_${Date.now()}`,
        title: data.title || 'New Link',
        url: data.url || '#',
        categoryId: data.categoryId!,
        iconDataUrl: data.iconDataUrl,
        clicks: 0
      };
      setLinks(prev => [...prev, newLink]);
    }
  };

  const handleExport = () => {
    const data = JSON.stringify({ categories, links, dashboardTitle, dashboardSubtitle, customTheme }, null, 2);
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'dashboard-backup.json';
    a.click();
  };

  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        try {
          const data = JSON.parse(event.target?.result as string);
          if (data.categories && data.links) {
            setCategories(data.categories);
            setLinks(data.links);
            if (data.dashboardTitle) setDashboardTitle(data.dashboardTitle);
            if (data.dashboardSubtitle) setDashboardSubtitle(data.dashboardSubtitle);
            if (data.customTheme) setCustomTheme(data.customTheme);
            alert("Dashboard imported successfully!");
          }
        } catch (error) {
          alert("Invalid JSON file");
        }
      };
      reader.readAsText(file);
    }
  };

  // Context Menu Handlers
  const handleContextMenu = (e: React.MouseEvent, linkId: string) => {
      e.preventDefault();
      const menuWidth = 192; // w-48
      let x = e.pageX;
      const y = e.pageY;
      
      // Check right edge
      if (x + menuWidth > window.innerWidth) {
          x = window.innerWidth - menuWidth - 10;
      }

      setContextMenu({
          visible: true,
          x,
          y,
          linkId
      });
  };

  const handleContextAction = (action: string) => {
      const link = links.find(l => l.id === contextMenu.linkId);
      if (!link) return;

      switch (action) {
          case 'edit':
              handleEditLink(link);
              break;
          case 'delete':
              handleDeleteLink(link.id);
              break;
          case 'reset':
              setLinks(prev => prev.map(l => l.id === link.id ? { ...l, clicks: 0 } : l));
              break;
          case 'copy':
              navigator.clipboard.writeText(link.url);
              break;
          case 'open':
              window.open(link.url, '_blank');
              break;
      }
      setContextMenu({ ...contextMenu, visible: false });
  };

  // --- Drag & Drop Logic ---
  const sensors = useSensors(
    useSensor(PointerSensor, {
        activationConstraint: {
            distance: 8,
        }
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragStart = (event: DragStartEvent) => {
    setActiveDragId(event.active.id as string);
  };

  const handleDragOver = (event: DragOverEvent) => {
    const { active, over } = event;
    if (!over) return;

    const activeId = active.id;
    const overId = over.id;

    const activeLink = links.find(l => l.id === activeId);
    const overLink = links.find(l => l.id === overId);
    const overCategory = categories.find(c => c.id === overId);

    if (!activeLink) return;

    if (overLink && activeLink.categoryId !== overLink.categoryId) {
        setLinks(prev => {
            return prev.map(l => {
                if (l.id === activeLink.id) {
                    return { ...l, categoryId: overLink.categoryId };
                }
                return l;
            });
        });
    }

    if (overCategory && activeLink.categoryId !== overCategory.id) {
        setLinks(prev => {
            return prev.map(l => {
                if (l.id === activeLink.id) {
                    return { ...l, categoryId: overCategory.id };
                }
                return l;
            });
        });
    }
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveDragId(null);

    if (!over) return;

    const activeId = active.id as string;
    const overId = over.id as string;

    if (activeId !== overId) {
      setLinks((items) => {
        const oldIndex = items.findIndex((i) => i.id === activeId);
        const newIndex = items.findIndex((i) => i.id === overId);
        return arrayMove(items, oldIndex, newIndex);
      });
    }
  };

  // --- Filtering & Commands ---
  const isCommand = searchQuery.startsWith('/');
  const filteredLinks = links.filter(link => 
    link.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    link.url.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const commands = [
      { cmd: '/theme', desc: 'Toggle Dark/Light Mode', action: toggleTheme },
      { cmd: '/add', desc: 'Add New Category', action: handleAddCategory },
      { cmd: '/widgets', desc: 'Toggle Widgets', action: () => setShowWidgets(!showWidgets) },
      { cmd: '/export', desc: 'Export Configuration', action: handleExport },
  ].filter(c => c.cmd.includes(searchQuery));

  // --- Dynamic Background Style ---
  // If custom image is set, we use it. Otherwise, InteractiveBackground is visible below.
  const backgroundStyle = customTheme.backgroundImage ? {
    backgroundImage: `url(${customTheme.backgroundImage})`,
    backgroundSize: 'cover',
    backgroundPosition: 'center',
    backgroundAttachment: 'fixed',
  } : {};

  return (
    <div 
        className="min-h-screen bg-background-light dark:bg-background-dark text-gray-900 dark:text-gray-100 font-sans transition-colors duration-300 selection:bg-primary/30 relative overflow-x-hidden"
        style={backgroundStyle}
        onContextMenu={(e) => {
            // Close context menu if clicking on background
            if (contextMenu.visible) setContextMenu({ ...contextMenu, visible: false });
        }}
    >
      {/* Interactive Mesh Background (Only shows if no custom image is set) */}
      {!customTheme.backgroundImage && <InteractiveBackground theme={theme} />}

      {/* Background Overlay for readability if image is set */}
      {customTheme.backgroundImage && (
          <div 
            className="absolute inset-0 bg-white/50 dark:bg-black/80 pointer-events-none z-0 transition-all duration-500"
            style={{ 
                opacity: (customTheme.backgroundOverlayOpacity !== undefined ? customTheme.backgroundOverlayOpacity : 80) / 100 
            }}
          />
      )}

      <div className="relative z-10 flex flex-col h-screen overflow-hidden">
        
        {/* Sticky Header */}
        <header className="shrink-0 z-40 w-full backdrop-blur-md bg-white/60 dark:bg-black/40 border-b border-gray-200/50 dark:border-gray-800/50 transition-all duration-300">
            <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between gap-4">
                
                {/* Widgets Toggle */}
                <button 
                    onClick={() => setShowWidgets(!showWidgets)}
                    className={`p-2 rounded-full transition-colors hidden sm:block ${showWidgets ? 'text-primary bg-primary/10' : 'text-gray-400 hover:text-gray-900 dark:hover:text-white'}`}
                    title="Toggle Power Sidebar (Alt+W)"
                >
                    <LayoutPanelLeft size={20} />
                </button>

                {/* Centered Search Bar */}
                <div className="flex-1 max-w-xl relative group">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        {isCommand ? <Command className="h-4 w-4 text-primary animate-pulse" /> : <Search className="h-4 w-4 text-gray-400 group-focus-within:text-primary transition-colors" />}
                    </div>
                    <input
                        ref={searchInputRef}
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="block w-full pl-10 pr-10 py-2 border border-gray-200/50 dark:border-gray-700/50 rounded-full leading-5 bg-gray-100/50 dark:bg-gray-900/50 text-sm text-gray-900 dark:text-gray-100 placeholder-gray-500 focus:outline-none focus:bg-white dark:focus:bg-black focus:ring-2 focus:ring-primary/20 focus:border-primary/50 transition-all shadow-sm backdrop-blur-sm"
                        placeholder="Search or type '/' for commands..."
                    />
                    {searchQuery && (
                        <button 
                            onClick={() => setSearchQuery('')}
                            className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
                        >
                            <X size={14} />
                        </button>
                    )}
                    
                    {/* Command Palette Dropdown */}
                    {isCommand && commands.length > 0 && (
                        <div className="absolute top-full left-0 right-0 mt-2 bg-white dark:bg-[#1a1a1a] rounded-xl shadow-xl border border-gray-200 dark:border-gray-800 overflow-hidden animate-fade-in">
                            {commands.map(c => (
                                <button 
                                    key={c.cmd}
                                    onClick={() => {
                                        c.action();
                                        setSearchQuery('');
                                    }}
                                    className="w-full text-left px-4 py-3 hover:bg-gray-50 dark:hover:bg-white/5 flex items-center justify-between group"
                                >
                                    <span className="font-mono text-primary font-bold">{c.cmd}</span>
                                    <span className="text-sm text-gray-500 group-hover:text-gray-900 dark:group-hover:text-white">{c.desc}</span>
                                </button>
                            ))}
                        </div>
                    )}
                </div>

                {/* Right Controls */}
                <div className="flex items-center gap-2 w-auto sm:w-auto justify-end">
                    <button 
                        onClick={toggleTheme} 
                        className="p-2 rounded-full text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-primary transition-all"
                        title={theme === 'dark' ? "Light Mode" : "Dark Mode"}
                    >
                        {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
                    </button>

                    {isEditMode && (
                        <button
                            onClick={() => setStyleModalOpen(true)}
                            className="p-2 rounded-full text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-primary transition-all"
                            title="Customize Style"
                        >
                            <Palette size={18} />
                        </button>
                    )}

                    <button 
                        onClick={() => setIsEditMode(!isEditMode)}
                        className={`
                        px-3 py-1.5 rounded-full font-medium text-xs transition-all flex items-center gap-1.5 border
                        ${isEditMode 
                            ? 'bg-primary text-white border-primary hover:bg-primary-hover shadow-md shadow-primary/20' 
                            : 'bg-white/50 dark:bg-gray-900/50 border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300 hover:border-primary/50 hover:text-primary'}
                        `}
                    >
                        {isEditMode ? <Save size={14} /> : <Settings size={14} />}
                        <span>{isEditMode ? 'Done' : 'Edit'}</span>
                    </button>
                </div>
            </div>
        </header>
        
        <div className="flex flex-1 overflow-hidden relative">
            {/* Main Content Area */}
            <div className={`flex-1 h-full overflow-y-auto custom-scrollbar transition-all duration-300 ${showWidgets ? 'mr-0 lg:mr-80' : ''}`}>
                <div className="max-w-5xl mx-auto px-4 pb-20">
                    
                    {/* Hero Section */}
                    <div className="py-12 text-center">
                        {isEditMode ? (
                            <input 
                                value={dashboardTitle}
                                onChange={(e) => setDashboardTitle(e.target.value)}
                                className="text-4xl md:text-5xl font-extrabold text-center bg-transparent border-b-2 border-dashed border-gray-300 dark:border-gray-700 focus:border-primary focus:outline-none text-gray-900 dark:text-white w-full max-w-2xl mx-auto mb-2 placeholder-gray-400 font-display"
                                placeholder="Dashboard Title"
                            />
                        ) : (
                            <h1 className="text-4xl md:text-5xl font-extrabold bg-clip-text text-transparent bg-gradient-to-br from-gray-900 via-gray-700 to-gray-500 dark:from-white dark:via-gray-200 dark:to-gray-500 mb-3 tracking-tight drop-shadow-sm font-display">
                                {dashboardTitle}
                            </h1>
                        )}

                        {isEditMode ? (
                            <input 
                                value={dashboardSubtitle}
                                onChange={(e) => setDashboardSubtitle(e.target.value)}
                                className="text-lg md:text-xl text-center bg-transparent border-b border-dashed border-gray-300 dark:border-gray-700 focus:border-primary focus:outline-none text-gray-600 dark:text-gray-400 w-full max-w-xl mx-auto placeholder-gray-500"
                                placeholder="Enter a subtitle..."
                            />
                        ) : (
                            <p className="text-lg md:text-xl text-gray-500 dark:text-gray-400 max-w-2xl mx-auto leading-relaxed font-light">
                                {dashboardSubtitle}
                            </p>
                        )}

                        {/* Action Bar (Edit Mode) */}
                        {isEditMode && (
                            <div className="mt-8 flex flex-wrap justify-center gap-3 animate-fade-in">
                                <button 
                                    onClick={handleAddCategory}
                                    className="flex items-center gap-2 px-5 py-2.5 bg-primary text-white rounded-xl hover:bg-primary-hover transition-all shadow-lg shadow-primary/25 font-medium hover:-translate-y-0.5"
                                >
                                    <Plus size={18} />
                                    <span>New Category</span>
                                </button>

                                <div className="w-px h-10 bg-gray-200 dark:bg-gray-800 mx-2 hidden sm:block"></div>

                                <label className="flex items-center gap-2 px-5 py-2.5 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer transition-all border border-gray-200 dark:border-gray-700 shadow-sm font-medium hover:-translate-y-0.5">
                                    <UploadIcon size={18} />
                                    <span>Import</span>
                                    <input type="file" accept=".json" onChange={handleImport} className="hidden" />
                                </label>
                                
                                <button 
                                    onClick={handleExport}
                                    className="flex items-center gap-2 px-5 py-2.5 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700 transition-all border border-gray-200 dark:border-gray-700 shadow-sm font-medium hover:-translate-y-0.5"
                                >
                                    <Download size={18} />
                                    <span>Export</span>
                                </button>
                            </div>
                        )}
                    </div>

                    {/* Links Grid */}
                    <DndContext 
                    sensors={sensors} 
                    collisionDetection={closestCenter}
                    onDragStart={handleDragStart}
                    onDragOver={handleDragOver}
                    onDragEnd={handleDragEnd}
                    >
                    <div className="space-y-6">
                        {categories.map(category => {
                            const categoryLinks = filteredLinks.filter(l => l.categoryId === category.id);
                            if (searchQuery && categoryLinks.length === 0 && !isEditMode) return null;

                            return (
                                <CategorySection
                                    key={category.id}
                                    category={category}
                                    links={categoryLinks}
                                    isEditMode={isEditMode}
                                    onAddLink={handleAddLink}
                                    onEditLink={handleEditLink}
                                    onDeleteLink={handleDeleteLink}
                                    onDeleteCategory={handleDeleteCategory}
                                    onRenameCategory={handleRenameCategory}
                                    onLinkClick={handleLinkClick}
                                    onContextMenu={handleContextMenu}
                                />
                            );
                        })}
                    </div>

                    <DragOverlay>
                        {activeDragId ? (
                        <div className="opacity-90 cursor-grabbing scale-105">
                            <div className="w-32 h-32 bg-white dark:bg-[#1a1a1a] rounded-2xl shadow-2xl flex items-center justify-center border border-primary/50">
                                {/* Drag Placeholder */}
                            </div>
                        </div>
                        ) : null}
                    </DragOverlay>
                    </DndContext>

                    {categories.length === 0 && (
                        <div className="flex flex-col items-center justify-center py-16 text-center border-2 border-dashed border-gray-200 dark:border-gray-800 rounded-3xl mt-4 bg-white/50 dark:bg-black/50 backdrop-blur-sm">
                            <div className="w-16 h-16 bg-gray-100 dark:bg-gray-800/50 rounded-full flex items-center justify-center mb-4 text-gray-400">
                                <Layout size={28} />
                            </div>
                            <h3 className="text-xl font-bold text-gray-800 dark:text-gray-200 mb-2">Initialize Workspace</h3>
                            <p className="text-gray-500 max-w-sm mb-6">Create a category to begin constructing your dashboard.</p>
                            <button 
                                onClick={handleAddCategory}
                                className="px-6 py-3 bg-primary text-white rounded-xl font-bold shadow-lg shadow-primary/30 hover:bg-primary-hover hover:scale-105 transition-all"
                            >
                                Create Category
                            </button>
                        </div>
                    )}
                </div>
            </div>

            {/* Widgets Sidebar */}
            <div className={`
                absolute inset-y-0 right-0 z-30 w-80 bg-white/80 dark:bg-[#121212]/90 backdrop-blur-2xl border-l border-gray-200/50 dark:border-gray-800/50 transform transition-transform duration-300 ease-in-out shadow-2xl
                ${showWidgets ? 'translate-x-0' : 'translate-x-full'}
            `}>
                <div className="h-full overflow-y-auto p-4 custom-scrollbar">
                    <Widgets />
                </div>
            </div>
        </div>

        {/* Modals & Menus */}
        <EditModal 
            isOpen={modalOpen} 
            onClose={() => setModalOpen(false)}
            onSave={handleSaveLink}
            initialData={editingLink}
            categories={categories}
            preselectedCategoryId={targetCategoryId}
        />
        
        <StyleModal
            isOpen={styleModalOpen}
            onClose={() => setStyleModalOpen(false)}
            theme={customTheme}
            onUpdate={setCustomTheme}
            onReset={() => setCustomTheme({ 
                primaryColor: '#7c3aed', 
                fontFamily: 'Inter', 
                backgroundImage: '', 
                backgroundOverlayOpacity: 80 
            })}
        />

        <ContextMenu 
            state={contextMenu}
            onClose={() => setContextMenu({ ...contextMenu, visible: false })}
            onEdit={() => handleContextAction('edit')}
            onDelete={() => handleContextAction('delete')}
            onResetStats={() => handleContextAction('reset')}
            onCopyUrl={() => handleContextAction('copy')}
            onOpenNewTab={() => handleContextAction('open')}
        />

        {contextMenu.visible && (
            <div 
                className="fixed inset-0 z-[90]" 
                onClick={() => setContextMenu({ ...contextMenu, visible: false })}
                onContextMenu={(e) => {
                    e.preventDefault();
                    setContextMenu({ ...contextMenu, visible: false });
                }}
            />
        )}
      </div>
    </div>
  );
}

export default App;
