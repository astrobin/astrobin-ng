import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { selectCamera, selectTelescope } from "@app/store/app.selectors";
import { AppState } from "@app/store/app.states";
import { Store } from "@ngrx/store";
import { CameraInterface } from "@shared/interfaces/camera.interface";
import { TelescopeInterface } from "@shared/interfaces/telescope.interface";
import { BaseClassicApiService } from "@shared/services/api/classic/base-classic-api.service";
import { CameraApiServiceInterface } from "@shared/services/api/classic/gear/camera/camera-api.service-interface";
import { LoadingService } from "@shared/services/loading.service";
import { Observable, of } from "rxjs";
import { switchMap } from "rxjs/operators";

@Injectable({
  providedIn: "root"
})
export class CameraApiService extends BaseClassicApiService implements CameraApiServiceInterface {
  configUrl = this.baseUrl + "/astrobin/camera";

  constructor(
    public readonly loadingService: LoadingService,
    public readonly store$: Store<AppState>,
    public readonly http: HttpClient
  ) {
    super(loadingService);
  }

  getCamera(id: number): Observable<CameraInterface> {
    return this.store$
      .select(selectCamera, id)
      .pipe(switchMap(camera => (camera ? of(camera) : this.http.get<CameraInterface>(`${this.configUrl}/${id}/`))));
  }
}
