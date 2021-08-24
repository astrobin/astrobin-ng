import { Injectable } from "@angular/core";
import { Observable } from "rxjs";
import { BaseClassicApiService } from "@shared/services/api/classic/base-classic-api.service";
import { MigratableGearItemServiceInterface } from "@shared/services/api/classic/astrobin/migratable-gear-item.service-interface";
import { LoadingService } from "@shared/services/loading.service";
import { HttpClient } from "@angular/common/http";

@Injectable({
  providedIn: "root"
})
export class CameraApiService extends BaseClassicApiService implements MigratableGearItemServiceInterface {
  configUrl = this.baseUrl + "/astrobin/camera";

  constructor(public loadingService: LoadingService, public readonly http: HttpClient) {
    super(loadingService);
  }

  getRandomNonMigrated(): Observable<any[]> {
    return this.http.get<any[]>(`${this.configUrl}/random-non-migrated`);
  }
}
