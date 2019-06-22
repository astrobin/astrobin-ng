import * as dotenv from "dotenv";
import * as fs from "fs";

export class ConfigService {
    private readonly envConfig: { [key: string]: string };

    constructor(filePath: string) {
        this.envConfig = dotenv.parse(fs.readFileSync(filePath));
    }

    get(key: string): string {
        return this.envConfig[key];
    }

    static getTypeOrmConfiguration(): any {
        const env: string = `${process.env.NODE_ENV}`;

        switch (env) {
            case "test":
            default:
                return {
                    type: "sqlite",
                    database: "local-database.db",
                    synchronize: true,
                    logging: false,
                    entities: [__dirname + "/**/*.entity{.ts,.js}"],
                };
        }
    }

    static getSecretJwtKey(): string {
        let secret: string = `${process.env.JWT_SECRET}`;

        if (secret === undefined) {
            // Does not really matter.
            secret = "test.jwt.secret";
        }

        return secret;
    }
}
