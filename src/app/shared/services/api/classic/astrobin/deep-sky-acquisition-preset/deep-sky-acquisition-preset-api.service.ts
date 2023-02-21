import { Injectable } from "@angular/core";
import { LoadingService } from "@shared/services/loading.service";
import { HttpClient } from "@angular/common/http";
import { forkJoin, Observable } from "rxjs";
import { BaseClassicApiService } from "@shared/services/api/classic/base-classic-api.service";
import { DeepSkyAcquisitionPresetInterface } from "@shared/interfaces/deep-sky-acquisition-preset.interface";

@Injectable({
  providedIn: "root"
})
export class DeepSkyAcquisitionPresetApiService extends BaseClassicApiService {
  configUrl = this.baseUrl + "/astrobin/deepsky-acquisition-preset";

  constructor(public readonly loadingService: LoadingService, public readonly http: HttpClient) {
    super(loadingService);
  }

  getAll(): Observable<DeepSkyAcquisitionPresetInterface[]> {
    return this.http.get<DeepSkyAcquisitionPresetInterface[]>(`${this.configUrl}/`);
  }

  create(presetItems: DeepSkyAcquisitionPresetInterface[]) {
    const observables: Observable<DeepSkyAcquisitionPresetInterface>[] = presetItems.map(preset =>
      this.http.post<DeepSkyAcquisitionPresetInterface>(`${this.configUrl}/`, preset)
    );

    return forkJoin(observables);
  }

  // update(preset: DeepSkyAcquisitionPresetInterface[]) {
  //   return this.http.put<DeepSkyAcquisitionPresetInterface[]>(`${this.configUrl}/${preset[0].id}/`, preset);
  // }

  delete(presetItems: DeepSkyAcquisitionPresetInterface[]) {
    const observables: Observable<void>[] = presetItems.map(preset =>
      this.http.delete<void>(`${this.configUrl}/${preset.id}`)
    );

    return forkJoin(observables);
  }
}
