'use client';

import { DashboardLayout } from '../../components/layout/DashboardLayout';
import { FavoritesSection } from '../../components/dashboard/FavoritesSection';

export default function FavoritesPage() {
  return (
    <DashboardLayout>
      <FavoritesSection />
    </DashboardLayout>
  );
}
