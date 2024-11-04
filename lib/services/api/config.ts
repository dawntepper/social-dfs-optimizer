export const API_CONFIG = {
  CACHE_DURATION: 5 * 60 * 1000, // 5 minutes
  RATE_LIMITS: {
    WEATHER: {
      REQUESTS_PER_MINUTE: 60,
      REQUESTS_PER_DAY: 1000
    },
    VEGAS: {
      REQUESTS_PER_MINUTE: 30,
      REQUESTS_PER_DAY: 500
    },
    ESPN: {
      REQUESTS_PER_MINUTE: 100,
      REQUESTS_PER_DAY: 2000
    },
    OPENAI: {
      REQUESTS_PER_MINUTE: 50,
      REQUESTS_PER_DAY: 1000
    }
  },
  ENDPOINTS: {
    WEATHER: process.env.WEATHER_API_URL || 'https://api.openweathermap.org/data/2.5',
    VEGAS: process.env.VEGAS_API_URL || 'https://api.the-odds-api.com/v4',
    ESPN: process.env.ESPN_API_URL || 'https://site.api.espn.com/apis/site/v2/sports/football/nfl',
    OPENAI: process.env.OPENAI_API_URL || 'https://api.openai.com/v1'
  }
};