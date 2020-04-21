import { Injectable } from "@angular/core";
import { BackendConfigGenerator } from "@lib/generators/backend-config.generator";
import { BackendConfigInterface } from "@lib/interfaces/backend-config.interface";
import { JsonApiServiceInterface } from "@lib/services/api/classic/json/json-api.service-interface";
import { Observable, of } from "rxjs";

@Injectable({
  providedIn: "root"
})
export class JsonApiServiceMock implements JsonApiServiceInterface {
  getBackendConfig(): Observable<BackendConfigInterface> {
    return of(BackendConfigGenerator.backendConfig());
  }
}
