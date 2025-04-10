import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import type { GearUserInfoInterface } from "@core/interfaces/gear-user-info.interface";
import type { UserInterface } from "@core/interfaces/user.interface";
import { MigratableGearItemApiService } from "@core/services/api/classic/astrobin/migratable-gear-item-api.service";
import type { PaginatedApiResultInterface } from "@core/services/api/interfaces/paginated-api-result.interface";
import { LoadingService } from "@core/services/loading.service";
import type { Observable } from "rxjs";

@Injectable({
  providedIn: "root"
})
export class GearUserInfoApiService extends MigratableGearItemApiService {
  configUrl = this.baseUrl + "/astrobin/gear-user-info";

  constructor(public readonly loadingService: LoadingService, public readonly http: HttpClient) {
    super(loadingService, http);
  }

  get(id: number): Observable<any> {
    return this.http.get<any>(`${this.configUrl}/${id}/`);
  }

  getForUserAndGear(
    userId: UserInterface["id"],
    gearId: number
  ): Observable<PaginatedApiResultInterface<GearUserInfoInterface>> {
    return this.http.get<PaginatedApiResultInterface<GearUserInfoInterface>>(
      `${this.configUrl}/?user=${userId}&gear=${gearId}`
    );
  }
}
