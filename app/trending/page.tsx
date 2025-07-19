'use client';

import { DashboardLayout } from '../../components/layout/DashboardLayout';
import { TrendingSection } from '../../components/dashboard/TrendingSection';

export default function TrendingPage() {
  return (
    <DashboardLayout>
      <TrendingSection />
    </DashboardLayout>
  );
}
