import { BackendConfigInterface } from "@lib/interfaces/backend-config.interface";
import { Observable } from "rxjs";

export interface JsonApiServiceInterface {
  getBackendConfig(): Observable<BackendConfigInterface>;
}
