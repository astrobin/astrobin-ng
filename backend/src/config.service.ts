export class ConfigService {
    static get(key: string): string {
        return process.env[key];
    }

    static getTypeOrmConfiguration(): any {
        const options = {
            type: process.env.DB_TYPE || "sqlite",
            database: undefined,
            url: undefined,
            synchronize: true,
            logging: false,
            entities: [__dirname + "/**/*.entity{.ts,.js}"],
            subscribers: [__dirname + "/**/*.entity-subscriber{.ts,.js}"],
        };

        if (options.type === "postgres") {
            options.url = process.env.DB_URL;
        } else {
            options.database = process.env.DB_NAME || "astrobin-api.db";
        }

        return options;
    }

    static getSecretJwtKey(): string {
        return process.env.JWT_SECRET || "test.jwt.secret";
    }
}
