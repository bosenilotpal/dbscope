import { Suspense } from 'react';
import ViewerContent from './viewer-content';

export default function ViewerPage() {
  return (
    <Suspense fallback={
      <div className="flex h-screen items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
      </div>
    }>
      <ViewerContent />
    </Suspense>
  );
}
