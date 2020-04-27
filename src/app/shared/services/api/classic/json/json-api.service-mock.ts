import { Injectable } from "@angular/core";
import { BackendConfigGenerator } from "@shared/generators/backend-config.generator";
import { BackendConfigInterface } from "@shared/interfaces/backend-config.interface";
import { JsonApiServiceInterface } from "@shared/services/api/classic/json/json-api.service-interface";
import { Observable, of } from "rxjs";

@Injectable({
  providedIn: "root"
})
export class JsonApiServiceMock implements JsonApiServiceInterface {
  getBackendConfig(): Observable<BackendConfigInterface> {
    return of(BackendConfigGenerator.backendConfig());
  }
}
