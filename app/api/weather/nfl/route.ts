import { NextResponse } from 'next/server';
import { weatherService } from '@/lib/services/weather/WeatherService';

const NFL_STADIUMS = {
  'KC': { name: 'Arrowhead Stadium', team: 'Chiefs', indoor: false },
  'BUF': { name: 'Highmark Stadium', team: 'Bills', indoor: false },
  'MIA': { name: 'Hard Rock Stadium', team: 'Dolphins', indoor: false },
  'MIN': { name: 'U.S. Bank Stadium', team: 'Vikings', indoor: true },
  'DET': { name: 'Ford Field', team: 'Lions', indoor: true },
  'DAL': { name: 'AT&T Stadium', team: 'Cowboys', indoor: true },
  'LV': { name: 'Allegiant Stadium', team: 'Raiders', indoor: true },
  'ARI': { name: 'State Farm Stadium', team: 'Cardinals', indoor: true }
};

export async function GET() {
  try {
    const weatherData = await Promise.all(
      Object.entries(NFL_STADIUMS).map(async ([code, stadium]) => {
        if (stadium.indoor) {
          return {
            stadium: stadium.name,
            team: stadium.team,
            temperature: 72,
            windSpeed: 0,
            precipitation: 0,
            isIndoors: true,
            total: 48.5, // Mock Vegas data
            spread: -3.5,
            homeTeam: stadium.team,
            awayTeam: 'Opponent', // This would come from schedule data
            kickoff: new Date().setHours(13, 0, 0), // Set to 1 PM local
          };
        }

        const weather = await weatherService.getGameWeather(code, code);
        return {
          stadium: stadium.name,
          team: stadium.team,
          ...weather,
          isIndoors: false,
          total: 48.5, // Mock Vegas data
          spread: -3.5,
          homeTeam: stadium.team,
          awayTeam: 'Opponent', // This would come from schedule data
          kickoff: new Date().setHours(13, 0, 0), // Set to 1 PM local
        };
      })
    );

    return NextResponse.json(weatherData);
  } catch (error) {
    console.error('Failed to fetch NFL weather data:', error);
    return NextResponse.json(
      { error: 'Failed to fetch weather data' },
      { status: 500 }
    );
  }
}