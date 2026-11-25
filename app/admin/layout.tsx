import AdminShell from '@/components/Admin/AdminShell';

export const metadata = { title: 'Control centre — GasRefill', robots: { index: false, follow: false } };

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return <AdminShell>{children}</AdminShell>;
}
