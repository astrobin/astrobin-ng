import { Injectable } from "@angular/core";
import { LoadingService } from "@shared/services/loading.service";
import { HttpClient } from "@angular/common/http";
import { MigratableGearItemApiService } from "@shared/services/api/classic/astrobin/migratable-gear-item-api.service";
import { Observable } from "rxjs";
import { AccessoryApiService } from "@shared/services/api/classic/astrobin/accessory/accessory-api.service";
import { FocalReducerApiService } from "@shared/services/api/classic/astrobin/focal-reducer/focal-reducer-api.service";
import { map, switchMap } from "rxjs/operators";

@Injectable({
  providedIn: "root"
})
export class CombinedAccessoryAndFocalReducerApiService extends MigratableGearItemApiService {
  constructor(
    public loadingService: LoadingService,
    public readonly http: HttpClient,
    public readonly accessoryApiService: AccessoryApiService,
    public readonly focalReducerApiService: FocalReducerApiService
  ) {
    super(loadingService, http);
  }

  getSimilarNonMigrated(gearId: number, isGlobal: boolean): Observable<any[]> {
    return this.accessoryApiService
      .getSimilarNonMigrated(gearId, isGlobal)
      .pipe(
        switchMap(accessories =>
          this.focalReducerApiService
            .getSimilarNonMigrated(gearId, isGlobal)
            .pipe(map(focalReducers => [...accessories, ...focalReducers]))
        )
      );
  }

  getSimilarNonMigratedByMakeAndName(make: string, name: string, isGlobal: boolean): Observable<any[]> {
    return this.accessoryApiService
      .getSimilarNonMigratedByMakeAndName(make, name, isGlobal)
      .pipe(
        switchMap(accessories =>
          this.focalReducerApiService
            .getSimilarNonMigratedByMakeAndName(make, name, isGlobal)
            .pipe(map(focalReducers => [...accessories, ...focalReducers]))
        )
      );
  }

  getRandomNonMigrated(isGlobal: boolean): Observable<any[]> {
    return this.accessoryApiService
      .getRandomNonMigrated(isGlobal)
      .pipe(
        switchMap(accessories =>
          this.focalReducerApiService
            .getRandomNonMigrated(isGlobal)
            .pipe(map(focalReducers => [...accessories, ...focalReducers]))
        )
      );
  }

  getNonMigratedCount(isGlobal: boolean): Observable<number> {
    return this.accessoryApiService
      .getNonMigratedCount(isGlobal)
      .pipe(
        switchMap(accessories =>
          this.focalReducerApiService
            .getNonMigratedCount(isGlobal)
            .pipe(map(focalReducers => accessories + focalReducers))
        )
      );
  }
}
