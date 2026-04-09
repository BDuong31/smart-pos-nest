import {
  WebSocketGateway,
  WebSocketServer,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from "@nestjs/websockets";
import { Server, Socket } from "socket.io";

interface UserSocketInfo {
  userId: string;
  role: string;
}

@WebSocketGateway({
  cors: true,
})
export class NotificationGateway
  implements OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer()
  server: Server;

   private userSockets = new Map<string, Set<string>>();

  private socketInfo = new Map<string, UserSocketInfo>();

  handleConnection(client: Socket) {
    const userId = client.handshake.query.userId as string;
    const role = client.handshake.query.role as string;

    if (!userId) return;

    if (!this.userSockets.has(userId)) {
      this.userSockets.set(userId, new Set());
    }

    this.userSockets.get(userId)!.add(client.id);

    this.socketInfo.set(client.id, { userId, role });

    if (role) {
      client.join(`role:${role}`);
    }

    client.join(`user:${userId}`);

    console.log(`User ${userId} (${role}) connected`);
  }

  handleDisconnect(client: Socket) {
    const info = this.socketInfo.get(client.id);
    if (!info) return;

    const { userId } = info;

    const sockets = this.userSockets.get(userId);
    if (sockets) {
      sockets.delete(client.id);
      if (sockets.size === 0) {
        this.userSockets.delete(userId);
      }
    }

    this.socketInfo.delete(client.id);

    console.log(`User ${userId} disconnected`);
  }

  emitToUser(userId: string, event: string, data: any) {
    this.server.to(`user:${userId}`).emit(event, data);
  }

  emitToRole(role: string, event: string, data: any) {
    this.server.to(`role:${role}`).emit(event, data);
  }

  emitAll(event: string, data: any) {
    this.server.emit(event, data);
  }

  emitToRoles(roles: string[], event: string, data: any) {
    roles.forEach((role) => {
      this.server.to(`role:${role}`).emit(event, data);
    });
  }

  emitToUsers(userIds: string[], event: string, data: any) {
    userIds.forEach((userId) => {
      this.server.to(`user:${userId}`).emit(event, data);
    });
  }
}