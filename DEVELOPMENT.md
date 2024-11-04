# NFL DFS Optimizer Development Guide

## Implementation Checklist (In Priority Order)

1. Data Import & Processing ⚡️ IN PROGRESS
   - ✅ CSV Upload UI
   - ✅ CSV Parser Implementation
   - ✅ DraftKings/FanDuel Format Support
   - ⏳ Sample CSV Templates
   - ⏳ Validation & Error Handling

2. Database Setup (Supabase)
   - Schema Design
   - User Authentication
   - Player Data Storage
   - Historical Performance Tracking
   - Lineup Storage
   - Settings Persistence

3. Social Media Integration
   - Twitter/X API Setup
   - Reddit API Integration
   - Beat Writer List Curation
   - Sentiment Analysis Implementation
   - Real-time Updates System

4. External APIs Integration
   - Weather API
   - Vegas Odds API
   - NFL Stats API
   - News Feed API

5. Advanced Features
   - Correlation Analysis
   - Game Stack Builder
   - Ownership Projections
   - Slate Breaking Analysis

## Local Development Setup

1. Clone repository
2. Copy .env.example to .env
3. Install dependencies: `npm install`
4. Run development server: `npm run dev`
5. Access at http://localhost:3000

## Testing Data

Sample data files are provided in `/samples`:
- `draftkings_sample.csv`
- `fanduel_sample.csv`

## API Requirements

### Twitter/X API
- Elevated access required
- Rate limits: 2M tweets/month
- Streaming API access

### Reddit API
- OAuth2 authentication
- Read-only access sufficient
- Rate limits: 60 requests/minute

### Weather API
- 5-day forecast
- Hourly updates
- Stadium-specific data

### Vegas Odds API
- Real-time line movements
- Game totals
- Team totals
- Spread history

## Database Schema (Supabase)

```sql
-- To be implemented
```

## Contributing

1. Create feature branch
2. Implement changes
3. Add tests
4. Submit PR