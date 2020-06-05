import { BackendConfigInterface } from "@shared/interfaces/backend-config.interface";

export class BackendConfigGenerator {
  static backendConfig(): BackendConfigInterface {
    return {
      version: "v2.0.0",
      i18nHash: "bc587c72ede144236ed01f2f5f8b290e"
    };
  }
}
