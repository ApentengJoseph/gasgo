import StaffLogin from '@/components/Auth/StaffLogin';

export const metadata = { title: 'Rider sign in — GasRefill', robots: { index: false } };
export default function RiderLoginPage() { return <StaffLogin role="rider" />; }
