import { NextResponse } from 'next/server';
import { weatherService } from '@/lib/services/weather/WeatherService';
import { slateService } from '@/lib/services/dfs/SlateDataService';

export async function GET() {
  try {
    const games = slateService.getGames();
    
    const weatherData = await Promise.all(
      games.map(async (game) => {
        const weather = await weatherService.getGameWeather(
          game.homeTeam,
          game.awayTeam
        );

        return {
          gameId: `${game.homeTeam}_${game.awayTeam}`,
          homeTeam: game.homeTeam,
          awayTeam: game.awayTeam,
          ...weather,
          kickoff: game.time
        };
      })
    );

    return NextResponse.json(weatherData);
  } catch (error) {
    console.error('Failed to fetch weather data:', error);
    return NextResponse.json(
      { error: 'Failed to fetch weather data' },
      { status: 500 }
    );
  }
}