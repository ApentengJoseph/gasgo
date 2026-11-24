import { PageSkeleton } from '@/components/UI/Skeletons';

// Shown inside the page frame while a route loads (never a blank screen).
export default function Loading() {
  return <PageSkeleton />;
}
