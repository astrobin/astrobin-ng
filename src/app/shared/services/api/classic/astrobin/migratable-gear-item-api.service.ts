import { Injectable } from "@angular/core";
import { EMPTY, Observable } from "rxjs";
import { BaseClassicApiService } from "@shared/services/api/classic/base-classic-api.service";
import {
  MigratableGearItemApiServiceInterface,
  MigrationFlag
} from "@shared/services/api/classic/astrobin/migratable-gear-item-api.service.interface";
import { LoadingService } from "@shared/services/loading.service";
import { HttpClient } from "@angular/common/http";
import { EquipmentItemBaseInterface, EquipmentItemType } from "@features/equipment/types/equipment-item-base.interface";
import { RejectMigrationReason } from "@features/equipment/components/migration/reject-migration-modal/reject-migration-modal.component";
import { catchError } from "rxjs/operators";

@Injectable({
  providedIn: "root"
})
export class MigratableGearItemApiService extends BaseClassicApiService
  implements MigratableGearItemApiServiceInterface {
  configUrl = this.baseUrl + "/astrobin/gear";

  constructor(public loadingService: LoadingService, public readonly http: HttpClient) {
    super(loadingService);
  }

  getSimilarNonMigrated(gearId: number): Observable<any[]> {
    return this.http.get<any[]>(`${this.configUrl}/${gearId}/similar-non-migrated/`);
  }

  getSimilarNonMigratedByMakeAndName(make: string, name: string): Observable<any[]> {
    return this.http.get<any[]>(`${this.configUrl}/similar-non-migrated/?make=${make}&name=${name}`);
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
    return this.http
      .put<void>(`${this.configUrl}/${gearId}/release-lock-for-migration/`, {})
      .pipe(catchError(err => EMPTY));
  }

  lockForMigrationReview(gearId: number): Observable<void> {
    return this.http.put<void>(`${this.configUrl}/${gearId}/lock-for-migration-review/`, {});
  }

  releaseLockForMigrationReview(gearId: number): Observable<void> {
    return this.http
      .put<void>(`${this.configUrl}/${gearId}/release-lock-for-migration-review/`, {})
      .pipe(catchError(err => EMPTY));
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

  approveMigration(gearId: number): Observable<any> {
    return this.http.put(`${this.configUrl}/${gearId}/approve-migration/`, {});
  }

  rejectMigration(gearId: number, reason: RejectMigrationReason, comment: string): Observable<any> {
    return this.http.put(`${this.configUrl}/${gearId}/reject-migration/`, { reason, comment });
  }
}
