import { WebSocketGateway, WebSocketServer, OnGatewayConnection } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';

@WebSocketGateway({
  cors: {
    origin: [
      process.env.FRONTEND_URL || 'http://localhost:3000',
      'http://localhost:3000',
      'http://192.168.1.75:3000',
    ],
    credentials: true,
  },
})
export class SalesGateway implements OnGatewayConnection {
  @WebSocketServer()
  server: Server;

  handleConnection(client: Socket) {
    client.emit('hola', { mensaje: 'Conexión establecida con el servidor' });
    console.log(`Cliente conectado: ${client.id}`);
  }
}
