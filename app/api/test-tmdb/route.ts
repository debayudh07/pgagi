import { NextResponse } from 'next/server';
import { MovieService } from '../../../services/api/movieService';

export async function GET() {
  try {
    console.log('🧪 Testing TMDB API Integration...');
    
    // Test popular movies
    const popularMovies = await MovieService.getPopularMovies({ page: 1 });
    console.log('📊 Popular Movies:', popularMovies.data?.length || 0, 'items');
    
    // Test trending movies
    const trendingMovies = await MovieService.getTrendingMovies();
    console.log('🔥 Trending Movies:', trendingMovies.data?.length || 0, 'items');
    
    // Test top-rated movies
    const topRatedMovies = await MovieService.getTopRatedMovies();
    console.log('⭐ Top Rated Movies:', topRatedMovies.data?.length || 0, 'items');
    
    // Test top-rated TV shows
    const topRatedTVShows = await MovieService.getTopRatedTVShows();
    console.log('📺 Top Rated TV Shows:', topRatedTVShows.data?.length || 0, 'items');
    
    // Test now playing movies
    const nowPlayingMovies = await MovieService.getNowPlayingMovies();
    console.log('🎬 Now Playing Movies:', nowPlayingMovies.data?.length || 0, 'items');
    
    // Test search
    const searchResults = await MovieService.searchMovies('Avengers');
    console.log('🔍 Search Results for "Avengers":', searchResults.data?.length || 0, 'items');

    const results = {
      success: true,
      tests: {
        popularMovies: {
          success: popularMovies.status === 'success',
          count: popularMovies.data?.length || 0,
          sample: popularMovies.data?.[0] || null
        },
        trendingMovies: {
          success: trendingMovies.status === 'success',
          count: trendingMovies.data?.length || 0,
          sample: trendingMovies.data?.[0] || null
        },
        topRatedMovies: {
          success: topRatedMovies.status === 'success',
          count: topRatedMovies.data?.length || 0,
          sample: topRatedMovies.data?.[0] || null
        },
        topRatedTVShows: {
          success: topRatedTVShows.status === 'success',
          count: topRatedTVShows.data?.length || 0,
          sample: topRatedTVShows.data?.[0] || null
        },
        nowPlayingMovies: {
          success: nowPlayingMovies.status === 'success',
          count: nowPlayingMovies.data?.length || 0,
          sample: nowPlayingMovies.data?.[0] || null
        },
        searchResults: {
          success: searchResults.status === 'success',
          count: searchResults.data?.length || 0,
          sample: searchResults.data?.[0] || null
        }
      },
      timestamp: new Date().toISOString()
    };

    console.log('✅ TMDB API Test Complete!');
    
    return NextResponse.json(results);
  } catch (error) {
    console.error('❌ TMDB API Test Failed:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    );
  }
}
