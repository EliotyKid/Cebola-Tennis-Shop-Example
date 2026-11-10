import type { Metadata } from 'next';
import type { ReactNode } from 'react';
import '@/styles/admin.css';

export const metadata: Metadata = { title: { default: 'Admin', template: '%s · Admin Cebola' }, robots: { index: false, follow: false } };

export default function AdminLayout({ children }: { children: ReactNode }) {
  return children;
}
