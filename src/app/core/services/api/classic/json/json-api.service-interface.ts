import type { BackendConfigInterface } from "@core/interfaces/backend-config.interface";
import type { Observable } from "rxjs";

export interface JsonApiServiceInterface {
  getBackendConfig(): Observable<BackendConfigInterface>;
}
