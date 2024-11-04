import { WebSocketManager } from '@/lib/services/alerts/WebSocketManager';

export function GET(req: Request) {
  const { socket, response } = Deno.upgradeWebSocket(req);
  const wsManager = WebSocketManager.getInstance();

  socket.onopen = () => {
    console.log("WebSocket connected");
  };

  socket.onmessage = async (event) => {
    try {
      const data = JSON.parse(event.data);
      
      switch (data.type) {
        case 'PROJECTION_UPDATE':
          await wsManager.handleProjectionUpdate(data);
          break;
        case 'SOCIAL_UPDATE':
          await wsManager.handleSocialUpdate(data);
          break;
        case 'WEATHER_UPDATE':
          await wsManager.handleWeatherUpdate(data);
          break;
      }
    } catch (error) {
      console.error('WebSocket message error:', error);
    }
  };

  socket.onerror = (error) => {
    console.error("WebSocket error:", error);
  };

  socket.onclose = () => {
    console.log("WebSocket closed");
  };

  return response;
}