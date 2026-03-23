import { Client } from '@stomp/stompjs';

class WebSocketService {
  constructor() {
    this.client = null;
  }

  connect(onMessageReceived) {
    this.client = new Client({
      brokerURL: 'ws://localhost:8080/demo-websocket',
      reconnectDelay: 5000,
      heartbeatIncoming: 4000,
      heartbeatOutgoing: 4000,
    });

    this.client.onConnect = (frame) => {
      console.log('Connected: ' + frame);
      this.client.subscribe('/topic/configs', (message) => {
        if (message.body) {
          onMessageReceived(JSON.parse(message.body));
        }
      });
    };

    this.client.onStompError = (frame) => {
      console.error('Broker reported error: ' + frame.headers['message']);
      console.error('Additional details: ' + frame.body);
    };

    this.client.activate();
  }

  disconnect() {
    if (this.client !== null) {
      this.client.deactivate();
    }
  }
}

export default new WebSocketService();
