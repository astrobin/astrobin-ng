import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { AppState } from "@app/store/app.states";
import { selectTelescope } from "@app/store/selectors/app/telescope.selectors";
import { Store } from "@ngrx/store";
import { TelescopeInterface } from "@shared/interfaces/telescope.interface";
import { BaseClassicApiService } from "@shared/services/api/classic/base-classic-api.service";
import { TelescopeApiServiceInterface } from "@shared/services/api/classic/gear/telescope/telescope-api.service-interface";
import { LoadingService } from "@shared/services/loading.service";
import { iif, Observable, of } from "rxjs";
import { switchMap } from "rxjs/operators";

@Injectable({
  providedIn: "root"
})
export class TelescopeApiService extends BaseClassicApiService implements TelescopeApiServiceInterface {
  configUrl = this.baseUrl + "/astrobin/telescope";

  constructor(
    public readonly loadingService: LoadingService,
    public readonly store$: Store<AppState>,
    public readonly http: HttpClient
  ) {
    super(loadingService);
  }

  getTelescope(id: number): Observable<TelescopeInterface> {
    return this.store$
      .select(selectTelescope, id)
      .pipe(
        switchMap(telescope =>
          telescope ? of(telescope) : this.http.get<TelescopeInterface>(`${this.configUrl}/${id}/`)
        )
      );
  }
}
