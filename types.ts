
export interface LinkItem {
  id: string;
  title: string;
  url: string;
  iconDataUrl?: string; // Base64 string for user uploaded image
  categoryId: string;
  clicks?: number;
}

export interface Category {
  id: string;
  title: string;
}

export type Theme = 'dark' | 'light';

export interface CustomTheme {
  primaryColor: string;
  fontFamily: string;
  backgroundImage?: string;
  backgroundOverlayOpacity?: number; // 0 to 100
}

export interface DragData {
  type: 'LINK' | 'CATEGORY';
  item: LinkItem | Category;
}

export interface ContextMenuState {
    visible: boolean;
    x: number;
    y: number;
    linkId: string | null;
}
