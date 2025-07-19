import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    domains: [
      'via.placeholder.com',
      'images.unsplash.com',
      'picsum.photos',
      'source.unsplash.com',
      'api.placeholder.com',
      'placeholder.com',
      'placehold.co',
      'dummyimage.com',
      // TMDB Image domains
      'image.tmdb.org',
      'www.themoviedb.org',
      // News Image domains
      'th-i.thgim.com',
      'www.thehindu.com',
      'images.indianexpress.com',
      'www.hindustantimes.com',
      'images.news18.com',
      'www.ndtv.com',
      'timesofindia.indiatimes.com',
      'akm-img-a-in.tosshub.com',
      'english.cdn.zeenews.com',
      'bsmedia.business-standard.com',
      'www.livemint.com',
      'gumlet.assettype.com',
      'c.ndtvimg.com',
      'img.etimg.com',
      'economictimes.indiatimes.com',
      // Spotify Image domains
      'i.scdn.co',
      'mosaic.scdn.co',
      'wrapped-images.spotifycdn.com',
      'lineup-images.scdn.co',
      'daily-mix.scdn.co',
      'charts-images.scdn.co',
      'seed-mix-image.spotifycdn.com'
    ],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'via.placeholder.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'picsum.photos',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'source.unsplash.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'api.placeholder.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'placeholder.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'placehold.co',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'dummyimage.com',
        port: '',
        pathname: '/**',
      },
      // TMDB Image domains
      {
        protocol: 'https',
        hostname: 'image.tmdb.org',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'www.themoviedb.org',
        port: '',
        pathname: '/**',
      },
      // Spotify Image domains
      {
        protocol: 'https',
        hostname: 'i.scdn.co',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'mosaic.scdn.co',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'wrapped-images.spotifycdn.com',
        port: '',
        pathname: '/**',
      },
    ],
  },
};

export default nextConfig;
