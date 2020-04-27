import { BackendConfigInterface } from "@shared/interfaces/backend-config.interface";

export class BackendConfigGenerator {
  static backendConfig(): BackendConfigInterface {
    return {
      version: "v2.0.0"
    };
  }
}
