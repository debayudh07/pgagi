'use client';

import { DashboardLayout } from '../../components/layout/DashboardLayout';
import { FeedSection } from '../../components/dashboard/FeedSection';

export default function DashboardPage() {
  return (
    <DashboardLayout>
      <FeedSection />
    </DashboardLayout>
  );
}
