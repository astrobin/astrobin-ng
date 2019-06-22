export class ConfigServiceMock {
    private readonly mockConfig: { [key: string]: string };

    constructor() {
        this.mockConfig = {
            DB_URL: "mockDatabaseUrl",
        };
    }

    get(key: string): string {
        return this.mockConfig[key];
    }
}
