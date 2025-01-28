import { BackendConfigInterface } from "@core/interfaces/backend-config.interface";
import { Observable } from "rxjs";

export interface JsonApiServiceInterface {
  getBackendConfig(): Observable<BackendConfigInterface>;
}
