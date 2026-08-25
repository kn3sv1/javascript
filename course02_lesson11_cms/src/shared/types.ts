export interface NavItem {
  id: number;
  label: string;
  path: string;
  order: number;
}
export type NavItemInput = Omit<NavItem, 'id'>;

export interface Page {
  id: number;
  path: string;
  title: string;
  content: string;
}
export type PageInput = Omit<Page, 'id'>;

export type BannerType = 'info' | 'promo' | 'warning';

export interface Banner {
  id: number;
  message: string;
  pattern: string;
  type: BannerType;
  active: boolean;
}
export type BannerInput = Omit<Banner, 'id'>;

export interface Photo {
  id: number;
  filename: string;
  url: string;
  alt: string;
}
export type PhotoInput = Omit<Photo, 'id'>;
