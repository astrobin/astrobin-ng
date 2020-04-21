import { BackendConfigInterface } from "@lib/interfaces/backend-config.interface";

export class BackendConfigGenerator {
  static backendConfig(): BackendConfigInterface {
    return {
      version: "v2.0.0"
    };
  }
}
