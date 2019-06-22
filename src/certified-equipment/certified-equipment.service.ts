import {ConfigService} from "../config.service";
import {Injectable} from "@nestjs/common";

@Injectable()
export class CertifiedEquipmentService {
    private dbUrl: string;

    constructor(config: ConfigService) {
        this.dbUrl = config.get("DB_URL");
    }
}
