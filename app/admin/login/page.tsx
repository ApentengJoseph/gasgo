import StaffLogin from '@/components/Auth/StaffLogin';

export const metadata = { title: 'Admin — GasRefill', robots: { index: false, follow: false } };
export const dynamic = 'force-dynamic';
export default function AdminLoginPage() { return <StaffLogin role="admin" mfa={process.env.ADMIN_MFA !== 'off'} />; }
