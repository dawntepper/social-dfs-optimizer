export class WebSocketService {
  private clients: Map<string, WebSocket> = new Map();

  addClient(userId: string, ws: WebSocket) {
    this.clients.set(userId, ws);

    ws.onclose = () => {
      this.clients.delete(userId);
    };
  }

  broadcastAlert(alert: any) {
    const message = JSON.stringify({
      type: 'PROJECTION_ALERT',
      data: alert
    });

    this.clients.forEach(client => {
      if (client.readyState === WebSocket.OPEN) {
        client.send(message);
      }
    });
  }

  sendUserAlert(userId: string, alert: any) {
    const client = this.clients.get(userId);
    if (client?.readyState === WebSocket.OPEN) {
      client.send(JSON.stringify({
        type: 'PROJECTION_ALERT',
        data: alert
      }));
    }
  }
}