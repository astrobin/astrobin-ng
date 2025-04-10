import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { UserInterface } from "@core/interfaces/user.interface";
import { LoadingService } from "@core/services/loading.service";
import { PopNotificationsService } from "@core/services/pop-notifications.service";
import { environment } from "@env/environment";
import { TranslateService } from "@ngx-translate/core";
import { Observable, of } from "rxjs";
import { catchError, finalize } from "rxjs/operators";

import { MeasurementPresetInterface } from "../measurement-preset.interface";

@Injectable({
  providedIn: "root"
})
export class MeasurementPresetApiService {
  protected readonly baseUrl: string = environment.classicApiUrl + "/api/v2";

  constructor(
    public readonly http: HttpClient,
    public readonly translateService: TranslateService,
    public readonly loadingService: LoadingService,
    public readonly popNotificationsService: PopNotificationsService
  ) {}

  /**
   * Set loading state
   * @param loading Loading state
   */
  protected setLoading(loading: boolean): void {
    this.loadingService.setLoading(loading);
  }

  /**
   * Get measurement presets for a user
   * @param userId User ID
   * @returns Observable of measurement presets
   */
  getMeasurementPresets(userId: UserInterface["id"]): Observable<MeasurementPresetInterface[]> {
    this.setLoading(true);

    return this.http
      .get<MeasurementPresetInterface[]>(this.baseUrl + `/equipment/measurement-preset/?user=${userId}`)
      .pipe(
        catchError(error => {
          this.popNotificationsService.error(this.translateService.instant("Error loading measurement presets"));
          this.setLoading(false);
          return of([]);
        }),
        finalize(() => this.setLoading(false))
      );
  }

  /**
   * Create a new measurement preset
   * @param preset Measurement preset data
   * @returns Observable of created measurement preset
   */
  createMeasurementPreset(preset: MeasurementPresetInterface): Observable<MeasurementPresetInterface> {
    const url = `${this.baseUrl}/equipment/measurement-preset/`;

    // Clean up the preset object before sending to API
    const cleanPreset = { ...preset };
    if (cleanPreset.widthArcseconds === null || cleanPreset.widthArcseconds === undefined) {
      delete cleanPreset.widthArcseconds;
    }

    if (cleanPreset.heightArcseconds === null || cleanPreset.heightArcseconds === undefined) {
      delete cleanPreset.heightArcseconds;
    }

    this.setLoading(true);

    return this.http.post<MeasurementPresetInterface>(url, cleanPreset).pipe(
      catchError(error => {
        console.error("MeasurementPresetApiService: Error creating preset:", error);
        this.popNotificationsService.error(this.translateService.instant("Error creating measurement preset"));
        this.setLoading(false);
        throw error;
      }),
      finalize(() => {
        this.setLoading(false);
      })
    );
  }

  /**
   * Update an existing measurement preset
   * @param preset Measurement preset data with ID
   * @returns Observable of updated measurement preset
   */
  updateMeasurementPreset(preset: MeasurementPresetInterface): Observable<MeasurementPresetInterface> {
    if (!preset.id) {
      throw new Error("Measurement preset ID is required for update");
    }

    this.setLoading(true);

    return this.http
      .put<MeasurementPresetInterface>(this.baseUrl + `/equipment/measurement-preset/${preset.id}/`, preset)
      .pipe(
        catchError(error => {
          this.popNotificationsService.error(this.translateService.instant("Error updating measurement preset"));
          this.setLoading(false);
          throw error;
        }),
        finalize(() => this.setLoading(false))
      );
  }

  /**
   * Delete a measurement preset
   * @param presetId Measurement preset ID
   * @returns Observable indicating success
   */
  deleteMeasurementPreset(presetId: number): Observable<void> {
    this.setLoading(true);

    return this.http.delete<void>(this.baseUrl + `/equipment/measurement-preset/${presetId}/`).pipe(
      catchError(error => {
        this.popNotificationsService.error(this.translateService.instant("Error deleting measurement preset"));
        this.setLoading(false);
        throw error;
      }),
      finalize(() => this.setLoading(false))
    );
  }
}
