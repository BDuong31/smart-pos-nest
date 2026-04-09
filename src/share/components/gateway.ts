import {
  WebSocketGateway,
  WebSocketServer,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from "@nestjs/websockets";
import { Server, Socket } from "socket.io";

// Interface để lưu thông tin người dùng
interface UserSocketInfo {
  userId: string;
  role: string;
}

// Gateway để giao tiếp real-time
@WebSocketGateway({
  cors: { origin: "*" },
})

// Lớp gateway để giao tiếp real-time
export class AppGateway
  implements OnGatewayConnection, OnGatewayDisconnect
{
  // Server socket
  @WebSocketServer()
  server: Server;

  // Map để lưu thông tin người dùng
  private userSockets = new Map<string, Set<string>>();

  // Map để lưu thông tin socket
  private socketInfo = new Map<string, UserSocketInfo>();

  // Xử lý khi có kết nối mới
  handleConnection(client: Socket) {
    // Lấy thông tin người dùng từ query
    const userId = client.handshake.query.userId as string;
    const role = client.handshake.query.role as string;

    if (!userId) return;

    // Thêm user vào map
    if (!this.userSockets.has(userId)) {
      this.userSockets.set(userId, new Set());
    }
    this.userSockets.get(userId)!.add(client.id);

    // Thêm socket vào map
    this.socketInfo.set(client.id, { userId, role });

    // Thêm user vào room
    if (role) {
      client.join(`role:${role}`);
    }

    client.join(`user:${userId}`);

    console.log(`User ${userId} (${role}) connected`);
  }

  // Xử lý khi có kết nối ngắt
  handleDisconnect(client: Socket) {
    const info = this.socketInfo.get(client.id);
    if (!info) return;

    const { userId } = info;

    // Xóa user khỏi map
    const sockets = this.userSockets.get(userId);
    if (sockets) {
      sockets.delete(client.id);
      if (sockets.size === 0) {
        this.userSockets.delete(userId);
      }
    }

    // Xóa socket khỏi map
    this.socketInfo.delete(client.id);

    console.log(`User ${userId} disconnected`);
  }

  // Gửi sự kiện đến user
  emitToUser(userId: string, event: string, data: any) {
    this.server.to(`user:${userId}`).emit(event, data);
  }

  // Gửi sự kiện đến role
  emitToRole(role: string, event: string, data: any) {
    this.server.to(`role:${role}`).emit(event, data);
  }

  // Gửi sự kiện đến tất cả
  emitAll(event: string, data: any) {
    this.server.emit(event, data);
  }

  // Gửi sự kiện đến nhiều role
  emitToRoles(roles: string[], event: string, data: any) {
    roles.forEach((role) => {
      this.server.to(`role:${role}`).emit(event, data);
    });
  }

  // Gửi sự kiện đến nhiều user
  emitToUsers(userIds: string[], event: string, data: any) {
    userIds.forEach((userId) => {
      this.server.to(`user:${userId}`).emit(event, data);
    });
  }
}