import { Inject, Injectable } from "@nestjs/common";
import { CACHE_SERVICE,type ICacheService } from "src/share";

@Injectable()
export class SystemService {
    constructor(
        @Inject(CACHE_SERVICE) private readonly redis: ICacheService,
    ) {}

    async setMaintenanceMode(enabled: boolean): Promise<void> {
        await this.redis.set(`system:maintenance`, String(enabled));
    }

    async isMaintenanceMode(): Promise<boolean> {
        const status = await this.redis.get(`system:maintenance`)
        return status === "true";
    }
}