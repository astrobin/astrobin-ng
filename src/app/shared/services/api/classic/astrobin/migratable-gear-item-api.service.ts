import { Injectable } from "@angular/core";
import { Observable } from "rxjs";
import { BaseClassicApiService } from "@shared/services/api/classic/base-classic-api.service";
import { MigratableGearItemApiServiceInterface } from "@shared/services/api/classic/astrobin/migratable-gear-item-api.service.interface";
import { LoadingService } from "@shared/services/loading.service";
import { HttpClient } from "@angular/common/http";

@Injectable({
  providedIn: "root"
})
export class MigratableGearItemApiService extends BaseClassicApiService
  implements MigratableGearItemApiServiceInterface {
  configUrl = this.baseUrl + "/astrobin/gear";

  constructor(public loadingService: LoadingService, public readonly http: HttpClient) {
    super(loadingService);
  }

  getRandomNonMigrated(): Observable<any[]> {
    return this.http.get<any[]>(`${this.configUrl}/random-non-migrated/`);
  }

  getNonMigratedCount(): Observable<number> {
    return this.http.get<number>(`${this.configUrl}/non-migrated-count/`);
  }
}
