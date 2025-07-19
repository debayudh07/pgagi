// MediaStack API Integration Test
// This file demonstrates the complete integration of MediaStack API

import { NewsService } from '../services/api/newsService';

export async function testMediaStackIntegration() {
  console.log('🧪 Testing MediaStack API Integration...');
  
  try {
    // Test 1: Fetch top headlines from India
    console.log('\n📰 Test 1: Fetching top headlines from India...');
    const headlines = await NewsService.getTopHeadlines({
      country: 'in',
      pageSize: 5
    });
    console.log(`✅ Headlines: ${headlines.data.length} articles found`);
    console.log(`📊 Total results: ${headlines.totalResults}`);
    console.log(`🔄 Status: ${headlines.status}`);
    
    // Test 2: Search for technology news
    console.log('\n🔍 Test 2: Searching for technology news...');
    const searchResults = await NewsService.searchNews('technology', 1);
    console.log(`✅ Search: ${searchResults.data.length} articles found`);
    console.log(`📊 Total results: ${searchResults.totalResults}`);
    console.log(`🔄 Status: ${searchResults.status}`);
    
    // Test 3: Fetch specific category
    console.log('\n📂 Test 3: Fetching business category news...');
    const businessNews = await NewsService.getTopHeadlines({
      country: 'in',
      category: 'business',
      pageSize: 3
    });
    console.log(`✅ Business: ${businessNews.data.length} articles found`);
    console.log(`📊 Total results: ${businessNews.totalResults}`);
    console.log(`🔄 Status: ${businessNews.status}`);
    
    console.log('\n🎉 All MediaStack API tests completed successfully!');
    
    return {
      headlines: headlines.data.length,
      search: searchResults.data.length,
      business: businessNews.data.length,
      success: true
    };
    
  } catch (error) {
    console.error('❌ MediaStack API Integration Test Failed:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}

// API Endpoints Summary
export const API_ENDPOINTS = {
  NEWS_HEADLINES: '/api/news',
  NEWS_SEARCH: '/api/news/search',
  MEDIASTACK_BASE: 'https://api.mediastack.com/v1/news'
};

// Supported Parameters
export const SUPPORTED_PARAMETERS = {
  country: ['in', 'us', 'gb', 'ca', 'au'], // India is default
  categories: ['general', 'business', 'entertainment', 'health', 'science', 'sports', 'technology'],
  sortBy: ['published_desc', 'published_asc', 'popularity'],
  pageSize: '1-100',
  page: '1-N'
};

export default {
  testMediaStackIntegration,
  API_ENDPOINTS,
  SUPPORTED_PARAMETERS
};
