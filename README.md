# PersonalDash - Personalized Content Dashboard

A modern, responsive dashboard application built with Next.js that aggregates and displays personalized content from multiple sources including news, movies, music, and social media.

## 🚀 Features

### Core Features
- **Personalized Content Feed**: Curated content based on user preferences
- **Interactive Content Cards**: Rich cards with images, metadata, and actions
- **Infinite Scrolling/Pagination**: Efficient content loading
- **Drag & Drop**: Reorder content cards in your feed
- **Search & Filter**: Advanced search with debounced input and filters
- **Favorites System**: Save and organize favorite content

### Dashboard Layout
- **Responsive Design**: Mobile-first responsive layout
- **Sidebar Navigation**: Easy navigation between sections
- **Top Header**: Search bar, notifications, and user settings
- **Dark Mode**: Toggle between light and dark themes

### Content Sources
- **News API**: Latest news based on categories
- **TMDB API**: Movie recommendations and trending films
- **Spotify API**: Music tracks and recommendations
- **Social Media**: Mock social media posts (easily extensible)

### Advanced Features
- **State Management**: Redux Toolkit with persistence
- **Internationalization**: Multi-language support (EN, ES, FR, DE)
- **Animations**: Smooth transitions with Framer Motion
- **Testing Ready**: Structure for unit, integration, and E2E tests
- **TypeScript**: Full type safety throughout the application

## 🛠️ Tech Stack

- **Frontend**: Next.js 15, React 19, TypeScript
- **State Management**: Redux Toolkit, Redux Persist
- **Styling**: Tailwind CSS, Custom CSS variables
- **Animations**: Framer Motion
- **Drag & Drop**: @dnd-kit
- **Icons**: Lucide React
- **Internationalization**: react-i18next
- **Forms**: React Hook Form with Zod validation
- **Development**: ESLint, TypeScript

## 📋 Prerequisites

- Node.js 18+ 
- npm or yarn
- API keys for external services (optional for demo)

## 🔧 Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd pgagi/frontend/client
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   Copy `.env.local` and update with your API keys:
   ```bash
   cp .env.local .env.local
   ```
   
   Update the following keys in `.env.local`:
   ```env
   NEXT_PUBLIC_NEWS_API_KEY=your_news_api_key_here
   NEXT_PUBLIC_TMDB_API_KEY=your_tmdb_api_key_here
   NEXT_PUBLIC_SPOTIFY_CLIENT_ID=your_spotify_client_id_here
   NEXT_PUBLIC_SPOTIFY_CLIENT_SECRET=your_spotify_client_secret_here
   ```

4. **Run the development server**
   ```bash
   npm run dev
   ```

5. **Open the application**
   Navigate to [http://localhost:3000](http://localhost:3000)

## 🎯 API Keys Setup

### News API
1. Visit [NewsAPI.org](https://newsapi.org/)
2. Sign up for a free account
3. Get your API key
4. Add to `NEXT_PUBLIC_NEWS_API_KEY`

### TMDB (The Movie Database)
1. Visit [TMDB](https://www.themoviedb.org/settings/api)
2. Create an account and request API key
3. Add to `NEXT_PUBLIC_TMDB_API_KEY`

### Spotify API
1. Visit [Spotify Developer Dashboard](https://developer.spotify.com/dashboard)
2. Create an app
3. Get Client ID and Secret
4. Add to `NEXT_PUBLIC_SPOTIFY_CLIENT_ID` and `NEXT_PUBLIC_SPOTIFY_CLIENT_SECRET`

**Note**: The application includes comprehensive mock data, so API keys are optional for development and testing.

## 🎨 Features Overview

### 1. Personalized Feed
- Aggregates content from multiple sources
- User preference-based filtering
- Drag & drop reordering
- Infinite scroll loading

### 2. Search & Discovery
- Real-time search with debouncing
- Advanced filtering by content type and category
- Search across all content sources
- Filter state persistence

### 3. Content Management
- Add/remove favorites
- Content type categorization
- Engagement metrics display
- External link integration

### 4. User Experience
- Dark/light mode toggle
- Multi-language support
- Responsive design
- Smooth animations
- Loading states and error handling

### 5. State Management
- Redux Toolkit for global state
- Local storage persistence
- Async data fetching
- Optimistic updates

## 📱 Pages & Routes

- `/` - Main personalized feed
- `/trending` - Trending content across all categories
- `/favorites` - User's saved content
- `/search` - Advanced search interface
- `/settings` - User preferences and configuration

## 🧪 Testing

The application is structured for comprehensive testing:

### Unit Tests
```bash
npm run test
```

### Integration Tests
```bash
npm run test:integration
```

### E2E Tests
```bash
npm run test:e2e
```

## 🌐 Internationalization

The app supports multiple languages:
- English (en)
- Spanish (es)
- French (fr)
- German (de)

Add new languages by creating translation files in `lib/locales/`.

## 🎨 Customization

### Themes
- Modify CSS variables in `globals.css`
- Update Tailwind configuration
- Create custom color schemes

### Content Sources
- Add new API services in `services/api/`
- Update content types in `types/index.ts`
- Implement new content card variants

### Components
- All components are modular and reusable
- Follow the established patterns for consistency
- Use TypeScript for type safety

## 🚀 Deployment

### Vercel (Recommended)
```bash
npm run build
vercel --prod
```

### Other Platforms
```bash
npm run build
npm start
```

## 📂 Project Structure

```
frontend/client/
├── app/                    # Next.js app directory
│   ├── globals.css        # Global styles
│   ├── layout.tsx         # Root layout
│   ├── page.tsx          # Home page
│   ├── trending/         # Trending page
│   ├── favorites/        # Favorites page
│   └── search/           # Search page
├── components/            # React components
│   ├── ui/               # Base UI components
│   ├── content/          # Content-related components
│   ├── dashboard/        # Dashboard sections
│   ├── forms/            # Form components
│   └── layout/           # Layout components
├── hooks/                # Custom React hooks
├── lib/                  # Utilities and configurations
│   ├── locales/          # Translation files
│   ├── utils.ts          # Utility functions
│   └── i18n.ts           # Internationalization config
├── services/             # API services
│   └── api/              # External API integrations
├── store/                # Redux store
│   └── slices/           # Redux slices
├── types/                # TypeScript type definitions
└── utils/                # Utility functions
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📝 License

This project is licensed under the MIT License.

## 🐛 Known Issues

- API rate limiting may affect real-time data updates
- Large image loading might impact performance on slow connections
- Some social media APIs require additional authentication

## 🔮 Future Enhancements

- Real-time WebSocket updates
- Enhanced analytics dashboard
- Content recommendation engine
- Offline support with PWA
- Advanced user authentication
- Content export functionality
- Custom content sources
- Advanced filtering options
- Social sharing features
- Content scheduling

## 📞 Support

For questions or support, please create an issue in the repository or contact the development team.
