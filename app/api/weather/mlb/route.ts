import { NextResponse } from 'next/server';
import { weatherService } from '@/lib/services/weather/WeatherService';

const MLB_STADIUMS = {
  'NYY': { name: 'Yankee Stadium', team: 'Yankees', indoor: false },
  'BOS': { name: 'Fenway Park', team: 'Red Sox', indoor: false },
  'CHC': { name: 'Wrigley Field', team: 'Cubs', indoor: false },
  'LAD': { name: 'Dodger Stadium', team: 'Dodgers', indoor: false },
  'SFG': { name: 'Oracle Park', team: 'Giants', indoor: false },
  'MIA': { name: 'LoanDepot Park', team: 'Marlins', indoor: true },
  'ARI': { name: 'Chase Field', team: 'Diamondbacks', indoor: true },
  'HOU': { name: 'Minute Maid Park', team: 'Astros', indoor: true },
  'TEX': { name: 'Globe Life Field', team: 'Rangers', indoor: true },
  'TOR': { name: 'Rogers Centre', team: 'Blue Jays', indoor: true }
};

export async function GET() {
  try {
    const weatherData = await Promise.all(
      Object.entries(MLB_STADIUMS).map(async ([code, stadium]) => {
        if (stadium.indoor) {
          return {
            stadium: stadium.name,
            team: stadium.team,
            temperature: 72,
            windSpeed: 0,
            humidity: 50,
            isIndoors: true,
            total: 8.5, // Mock Vegas data
            spread: -1.5,
            homeTeam: stadium.team,
            awayTeam: 'Opponent', // This would come from schedule data
            firstPitch: new Date().setHours(19, 10, 0), // Set to 7:10 PM local
          };
        }

        const weather = await weatherService.getGameWeather(code, code);
        return {
          stadium: stadium.name,
          team: stadium.team,
          ...weather,
          humidity: 65, // Mock humidity data
          isIndoors: false,
          total: 8.5, // Mock Vegas data
          spread: -1.5,
          homeTeam: stadium.team,
          awayTeam: 'Opponent', // This would come from schedule data
          firstPitch: new Date().setHours(19, 10, 0), // Set to 7:10 PM local
        };
      })
    );

    return NextResponse.json(weatherData);
  } catch (error) {
    console.error('Failed to fetch MLB weather data:', error);
    return NextResponse.json(
      { error: 'Failed to fetch weather data' },
      { status: 500 }
    );
  }
}