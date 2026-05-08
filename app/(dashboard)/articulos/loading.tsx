import { SkeletonTable, SkeletonCard } from '@/components/ui/Skeleton'
export default function Loading() {
  return <div className='space-y-5'><SkeletonTable rows={5} /></div>
}

