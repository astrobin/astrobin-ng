import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import type { MountInterface } from "@core/interfaces/mount.interface";
import { BaseClassicApiService } from "@core/services/api/classic/base-classic-api.service";
import type { MountApiServiceInterface } from "@core/services/api/classic/gear/mount/mount-api.service-interface";
import { LoadingService } from "@core/services/loading.service";
import type { Observable } from "rxjs";

@Injectable({
  providedIn: "root"
})
export class MountApiService extends BaseClassicApiService implements MountApiServiceInterface {
  configUrl = this.baseUrl + "/astrobin/mount";

  constructor(public readonly loadingService: LoadingService, public readonly http: HttpClient) {
    super(loadingService);
  }

  get(id: number): Observable<MountInterface> {
    return this.http.get<MountInterface>(`${this.configUrl}/${id}/`);
  }
}
