import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { SoftwareInterface } from "@shared/interfaces/software.interface";
import { BaseClassicApiService } from "@shared/services/api/classic/base-classic-api.service";
import { SoftwareApiServiceInterface } from "@shared/services/api/classic/gear/software/software-api.service-interface";
import { LoadingService } from "@shared/services/loading.service";
import { Observable } from "rxjs";

@Injectable({
  providedIn: "root"
})
export class SoftwareApiService extends BaseClassicApiService implements SoftwareApiServiceInterface {
  configUrl = this.baseUrl + "/astrobin/software";

  constructor(public readonly loadingService: LoadingService, public readonly http: HttpClient) {
    super(loadingService);
  }

  get(id: number): Observable<SoftwareInterface> {
    return this.http.get<SoftwareInterface>(`${this.configUrl}/${id}/`);
  }
}
