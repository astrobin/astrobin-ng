import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import {
  MigratableGearItemApiServiceInterface,
  MigrationFlag
} from "@core/services/api/classic/astrobin/migratable-gear-item-api.service.interface";
import { BaseClassicApiService } from "@core/services/api/classic/base-classic-api.service";
import { LoadingService } from "@core/services/loading.service";
import { UtilsService } from "@core/services/utils/utils.service";
import { EquipmentItemBaseInterface, EquipmentItemType } from "@features/equipment/types/equipment-item-base.interface";
import { EMPTY, Observable } from "rxjs";
import { catchError } from "rxjs/operators";

@Injectable({
  providedIn: "root"
})
export class MigratableGearItemApiService
  extends BaseClassicApiService
  implements MigratableGearItemApiServiceInterface
{
  configUrl = this.baseUrl + "/astrobin/gear";

  constructor(public loadingService: LoadingService, public readonly http: HttpClient) {
    super(loadingService);
  }

  getSimilarNonMigrated(gearId: number, isGlobal: boolean): Observable<any[]> {
    let url = `${this.configUrl}/${gearId}/similar-non-migrated/`;

    if (isGlobal) {
      url = UtilsService.addOrUpdateUrlParam(url, "global", "1");
    }

    return this.http.get<any[]>(url);
  }

  getSimilarNonMigratedByMakeAndName(make: string, name: string, isGlobal: boolean): Observable<any[]> {
    let url = `${this.configUrl}/similar-non-migrated/?make=${make}&name=${name}`;

    url = UtilsService.addOrUpdateUrlParam(url, "make", make);
    url = UtilsService.addOrUpdateUrlParam(url, "name", name);

    if (isGlobal) {
      url = UtilsService.addOrUpdateUrlParam(url, "global", "1");
    }

    return this.http.get<any[]>(url);
  }

  getRandomNonMigrated(isGlobal: boolean): Observable<any[]> {
    let url = `${this.configUrl}/random-non-migrated/`;

    if (isGlobal) {
      url = UtilsService.addOrUpdateUrlParam(url, "global", "1");
    }

    return this.http.get<any[]>(url);
  }

  getNonMigratedCount(isGlobal: boolean): Observable<number> {
    let url = `${this.configUrl}/non-migrated-count/`;

    if (isGlobal) {
      url = UtilsService.addOrUpdateUrlParam(url, "global", "1");
    }

    return this.http.get<number>(url);
  }

  lockForMigration(gearId: number): Observable<void> {
    return this.http.put<void>(`${this.configUrl}/${gearId}/lock-for-migration/`, {});
  }

  releaseLockForMigration(gearId: number): Observable<void> {
    return this.http
      .put<void>(`${this.configUrl}/${gearId}/release-lock-for-migration/`, {})
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
}
