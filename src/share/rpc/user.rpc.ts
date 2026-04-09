import { Injectable } from '@nestjs/common';
import { PublicUser, IPublicUserRpc } from '..';
import axios from 'axios';

@Injectable()
export class UserRPCClient implements IPublicUserRpc {
  constructor(private readonly userServiceUrl: string) {}

  async getUserById(id: string): Promise<PublicUser | null> {
    try {
      // Định nghĩa kiểu dữ liệu ngay tại axios.get
      const { data } = await axios.get<{ data: PublicUser }>(
        `${this.userServiceUrl}/rpc/users/${id}`
      );

      const user = data.data; // Lúc này user đã có kiểu PublicUser, không còn là any
      if (!user) return null;

      return {
        id: user.id || '',
        username: user.username,
        email: user.email,
        fullName: user.fullName,
        birthday: user.birthday,
        rankId: user.rankId,
      };
    } catch (error) {
      console.error('Error fetching user:', error);
      return null;
    }
  }

  async getUsersByIds(ids: string[]): Promise<PublicUser[]> {
    try {
      const response = await axios.post(`${this.userServiceUrl}/rpc/users/list-by-ids`, { ids });
      const users = response.data.data.map((user: any) => {
        return {
            id: user.id,
            username: user.username,
            email: user.email,
            fullName: user.fullName,
            birthday: user.birthday,
            rankId: user.rankId,
        };
      })

      return users;
    } catch (error) {
      return [];
    }
  }
}
