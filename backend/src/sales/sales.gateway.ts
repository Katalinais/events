import { WebSocketGateway, WebSocketServer, OnGatewayConnection } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';

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

  constructor(
    private readonly jwtService: JwtService,
    private readonly config: ConfigService,
  ) {}

  handleConnection(client: Socket) {
    client.emit('hola', { mensaje: 'Conexión establecida con el servidor' });

    const token =
      client.handshake.auth?.token ||
      client.handshake.headers?.authorization?.replace('Bearer ', '');

    if (token) {
      try {
        const payload = this.jwtService.verify(token, {
          secret: this.config.get<string>('JWT_SECRET'),
        });
        const userId = payload.sub;
        client.join(`user-${userId}`);
      } catch {
        // token inválido, el socket sigue conectado pero sin room de usuario
      }
    }
  }

  emitToUser(userId: string, event: string, data: unknown) {
    this.server.to(`user-${userId}`).emit(event, data);
  }
}
