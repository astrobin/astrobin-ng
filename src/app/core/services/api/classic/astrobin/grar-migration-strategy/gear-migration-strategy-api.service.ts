import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { BaseClassicApiService } from "@core/services/api/classic/base-classic-api.service";
import { PaginatedApiResultInterface } from "@core/services/api/interfaces/paginated-api-result.interface";
import { LoadingService } from "@core/services/loading.service";
import { RejectMigrationReason } from "@features/equipment/components/migration/reject-migration-modal/reject-migration-modal.component";
import { Observable, EMPTY } from "rxjs";
import { catchError } from "rxjs/operators";

@Injectable({
  providedIn: "root"
})
export class GearMigrationStrategyApiService extends BaseClassicApiService {
  configUrl = this.baseUrl + "/astrobin/gear-migration-strategy";

  constructor(public readonly loadingService: LoadingService, public readonly http: HttpClient) {
    super(loadingService);
  }

  get(id: number): Observable<any> {
    return this.http.get<any>(`${this.configUrl}/${id}/`);
  }

  getAll(): Observable<PaginatedApiResultInterface<any>> {
    return this.http.get<PaginatedApiResultInterface<any>>(`${this.configUrl}/`);
  }

  getPendingReview(): Observable<PaginatedApiResultInterface<any>> {
    return this.http.get<PaginatedApiResultInterface<any>>(`${this.configUrl}/?pending-review=true`);
  }

  lockForMigrationReview(gearMigrationStrategyId: number): Observable<void> {
    return this.http.put<void>(`${this.configUrl}/${gearMigrationStrategyId}/lock-for-migration-review/`, {});
  }

  releaseLockForMigrationReview(gearMigrationStrategyId: number): Observable<void> {
    return this.http
      .put<void>(`${this.configUrl}/${gearMigrationStrategyId}/release-lock-for-migration-review/`, {})
      .pipe(catchError(err => EMPTY));
  }

  approve(migrationStrategyId: number): Observable<any> {
    return this.http.put(`${this.configUrl}/${migrationStrategyId}/approve/`, {});
  }

  reject(migrationStrategyId: number, reason: RejectMigrationReason, comment: string): Observable<any> {
    return this.http.put(`${this.configUrl}/${migrationStrategyId}/reject/`, { reason, comment });
  }

  undo(migrationStrategyId: number): Observable<void> {
    return this.http.put<void>(`${this.configUrl}/${migrationStrategyId}/undo/`, {});
  }
}
