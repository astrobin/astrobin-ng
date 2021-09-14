import { Injectable } from "@angular/core";
import { Observable } from "rxjs";
import { BaseClassicApiService } from "@shared/services/api/classic/base-classic-api.service";
import {
  MigratableGearItemApiServiceInterface,
  MigrationFlag
} from "@shared/services/api/classic/astrobin/migratable-gear-item-api.service.interface";
import { LoadingService } from "@shared/services/loading.service";
import { HttpClient } from "@angular/common/http";
import {
  EquipmentItemBaseInterface,
  EquipmentItemType
} from "@features/equipment/interfaces/equipment-item-base.interface";
import { RejectMigrationReason } from "@features/equipment/components/migration/reject-migration-modal/reject-migration-modal.component";

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

  getPendingMigrationReview(): Observable<any[]> {
    return this.http.get<any[]>(`${this.configUrl}/pending-migration-review/`);
  }

  lockForMigration(gearId: number): Observable<void> {
    return this.http.put<void>(`${this.configUrl}/${gearId}/lock-for-migration/`, {});
  }

  releaseLockForMigration(gearId: number): Observable<void> {
    return this.http.put<void>(`${this.configUrl}/${gearId}/release-lock-for-migration/`, {});
  }

  lockForMigrationReview(gearId: number): Observable<void> {
    return this.http.put<void>(`${this.configUrl}/${gearId}/lock-for-migration-review/`, {});
  }

  releaseLockForMigrationReview(gearId: number): Observable<void> {
    return this.http.put<void>(`${this.configUrl}/${gearId}/release-lock-for-migration-review/`, {});
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

  acceptMigration(gearId: number): Observable<any> {
    return this.http.put(`${this.configUrl}/${gearId}/accept-migration/`, {});
  }

  rejectMigration(gearId: number, reason: RejectMigrationReason, comment: string): Observable<any> {
    return this.http.put(`${this.configUrl}/${gearId}/reject-migration/`, { reason, comment });
  }
}
