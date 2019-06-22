import {ConfigService} from "../config.service";
import {Injectable} from "@nestjs/common";

@Injectable()
export class CertifiedEquipmentService {
    private readonly databaseUrl: string;

    constructor(config: ConfigService) {
        this.databaseUrl = config.get("DB_URL");
    }

    public getDatabaseUrl(): string {
        return this.databaseUrl;
    }
}
