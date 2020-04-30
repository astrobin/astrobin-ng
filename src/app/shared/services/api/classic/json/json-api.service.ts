import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { environment } from "@env/environment";
import { JsonApiServiceInterface } from "@shared/services/api/classic/json/json-api.service-interface";
import { LoadingService } from "@shared/services/loading.service";
import { Observable } from "rxjs";
import { BaseClassicApiService } from "../base-classic-api.service";

@Injectable({
  providedIn: "root"
})
export class JsonApiService extends BaseClassicApiService implements JsonApiServiceInterface {
  configUrl = environment.classicApiUrl + "/json-api";

  constructor(public loadingService: LoadingService, public http: HttpClient) {
    super(loadingService);
  }

  getBackendConfig(): Observable<{ version: string }> {
    return this.http.get<{ version: string }>(`${this.configUrl}/common/app-config/`);
  }
}
