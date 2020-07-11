import { Injectable } from "@angular/core";
import { BackendConfigGenerator } from "@shared/generators/backend-config.generator";
import { BackendConfigInterface } from "@shared/interfaces/backend-config.interface";
import { JsonApiServiceInterface } from "@shared/services/api/classic/json/json-api.service-interface";
import { BaseService } from "@shared/services/base.service";
import { Observable, of } from "rxjs";

@Injectable({
  providedIn: "root"
})
export class JsonApiServiceMock extends BaseService implements JsonApiServiceInterface {
  getBackendConfig$(): Observable<BackendConfigInterface> {
    return of(BackendConfigGenerator.backendConfig());
  }
}
