import type { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import type { CameraInterface } from "@core/interfaces/camera.interface";
import { BaseClassicApiService } from "@core/services/api/classic/base-classic-api.service";
import type { CameraApiServiceInterface } from "@core/services/api/classic/gear/camera/camera-api.service-interface";
import type { LoadingService } from "@core/services/loading.service";
import type { Observable } from "rxjs";

@Injectable({
  providedIn: "root"
})
export class CameraApiService extends BaseClassicApiService implements CameraApiServiceInterface {
  configUrl = this.baseUrl + "/astrobin/camera";

  constructor(public readonly loadingService: LoadingService, public readonly http: HttpClient) {
    super(loadingService);
  }

  get(id: number): Observable<CameraInterface> {
    return this.http.get<CameraInterface>(`${this.configUrl}/${id}/`);
  }
}
