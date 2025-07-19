'use client';

import { DashboardLayout } from '../../components/layout/DashboardLayout';
import { FeedSection } from '../../components/dashboard/FeedSection';
import { NewsSection } from '../../components/dashboard/NewsSection';
import { MoviesSection } from '../../components/dashboard/MoviesSection';
import { MusicSection } from '../../components/dashboard/MusicSection';
import { SocialSection } from '../../components/dashboard/SocialSection';
import { TrendingSection } from '../../components/dashboard/TrendingSection';
import { FavoritesSection } from '../../components/dashboard/FavoritesSection';
import { TabNavigation } from '../../components/dashboard/TabNavigation';
import { useAppSelector } from '../../hooks/redux';

export default function DashboardPage() {
  const { activeTab } = useAppSelector(state => state.content);

  const renderActiveSection = () => {
    switch (activeTab) {
      case 'feed':
        return <FeedSection />;
      case 'news':
        return <NewsSection />;
      case 'movies':
        return <MoviesSection />;
      case 'music':
        return <MusicSection />;
      case 'social':
        return <SocialSection />;
      case 'trending':
        return <TrendingSection />;
      case 'favorites':
        return <FavoritesSection />;
      default:
        return <FeedSection />;
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <TabNavigation />
        {renderActiveSection()}
      </div>
    </DashboardLayout>
  );
}
