import type { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { MigratableGearItemApiService } from "@core/services/api/classic/astrobin/migratable-gear-item-api.service";
import type { LoadingService } from "@core/services/loading.service";

@Injectable({
  providedIn: "root"
})
export class SoftwareApiService extends MigratableGearItemApiService {
  configUrl = this.baseUrl + "/astrobin/software";

  constructor(public loadingService: LoadingService, public readonly http: HttpClient) {
    super(loadingService, http);
  }
}
