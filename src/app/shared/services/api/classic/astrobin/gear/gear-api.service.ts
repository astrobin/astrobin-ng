import { Injectable } from "@angular/core";
import { BaseClassicApiService } from "@shared/services/api/classic/base-classic-api.service";
import {
  MigratableGearItemServiceInterface,
  MigrationFlag
} from "@shared/services/api/classic/astrobin/migratable-gear-item.service-interface";
import { LoadingService } from "@shared/services/loading.service";
import { HttpClient } from "@angular/common/http";
import { Observable } from "rxjs";
import {
  EquipmentItemBaseInterface,
  EquipmentItemType
} from "@features/equipment/interfaces/equipment-item-base.interface";

@Injectable({
  providedIn: "root"
})
export class GearApiService extends BaseClassicApiService implements MigratableGearItemServiceInterface {
  configUrl = this.baseUrl + "/astrobin/gear";

  constructor(public readonly loadingService: LoadingService, public readonly http: HttpClient) {
    super(loadingService);
  }

  get(id: number): Observable<any> {
    return this.http.get<any>(`${this.configUrl}/${id}/`);
  }

  getRandomNonMigrated(): Observable<any[]> {
    return this.http.get<any[]>(`${this.configUrl}/random-non-migrated/`);
  }

  getPendingMigrationReview(): Observable<any[]> {
    return this.http.get<any[]>(`${this.configUrl}/pending-migration-review/`);
  }

  lockForMigration(gearId: number): Observable<void> {
    return this.http.put<void>(`${this.configUrl}/${gearId}/lock-for-migration/`, {});
  }

  setMigration(
    gearId: number,
    migrationFlag: MigrationFlag,
    itemType?: EquipmentItemType,
    itemId?: EquipmentItemBaseInterface["id"]
  ) {
    return this.http.put(`${this.configUrl}/${gearId}/set-migration/`, {
      migrationFlag,
      itemType,
      itemId
    });
  }
}
