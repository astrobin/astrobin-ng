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
import { catchError } from "rxjs/operators";
import { UtilsService } from "@shared/services/utils/utils.service";

@Injectable({
  providedIn: "root"
})
export class MigratableGearItemApiService extends BaseClassicApiService
  implements MigratableGearItemApiServiceInterface {
  configUrl = this.baseUrl + "/astrobin/gear";

  constructor(public loadingService: LoadingService, public readonly http: HttpClient) {
    super(loadingService);
  }

  getSimilarNonMigrated(gearId: number, global: boolean): Observable<any[]> {
    let url = `${this.configUrl}/${gearId}/similar-non-migrated/`;

    if (global) {
      url = UtilsService.addOrUpdateUrlParam(url, "global", "1");
    }

    return this.http.get<any[]>(url);
  }

  getSimilarNonMigratedByMakeAndName(make: string, name: string, global: boolean): Observable<any[]> {
    let url = `${this.configUrl}/similar-non-migrated/?make=${make}&name=${name}`;

    url = UtilsService.addOrUpdateUrlParam(url, "make", make);
    url = UtilsService.addOrUpdateUrlParam(url, "name", name);

    if (global) {
      url = UtilsService.addOrUpdateUrlParam(url, "global", "1");
    }

    return this.http.get<any[]>(url);
  }

  getRandomNonMigrated(global: boolean): Observable<any[]> {
    let url = `${this.configUrl}/random-non-migrated/`;

    if (global) {
      url = UtilsService.addOrUpdateUrlParam(url, "global", "1");
    }

    return this.http.get<any[]>(url);
  }

  getNonMigratedCount(global: boolean): Observable<number> {
    let url = `${this.configUrl}/non-migrated-count/`;

    if (global) {
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
