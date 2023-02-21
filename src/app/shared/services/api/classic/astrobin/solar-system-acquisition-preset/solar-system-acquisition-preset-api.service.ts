import { Injectable } from "@angular/core";
import { LoadingService } from "@shared/services/loading.service";
import { HttpClient } from "@angular/common/http";
import { forkJoin, Observable } from "rxjs";
import { BaseClassicApiService } from "@shared/services/api/classic/base-classic-api.service";
import { SolarSystemAcquisitionPresetInterface } from "@shared/interfaces/solar-system-acquisition-preset.interface";

@Injectable({
  providedIn: "root"
})
export class SolarSystemAcquisitionPresetApiService extends BaseClassicApiService {
  configUrl = this.baseUrl + "/astrobin/solarsystem-acquisition-preset";

  constructor(public readonly loadingService: LoadingService, public readonly http: HttpClient) {
    super(loadingService);
  }

  getAll(): Observable<SolarSystemAcquisitionPresetInterface[]> {
    return this.http.get<SolarSystemAcquisitionPresetInterface[]>(`${this.configUrl}/`);
  }

  create(presetItems: SolarSystemAcquisitionPresetInterface[]) {
    const observables: Observable<SolarSystemAcquisitionPresetInterface>[] = presetItems.map(preset =>
      this.http.post<SolarSystemAcquisitionPresetInterface>(`${this.configUrl}/`, preset)
    );

    return forkJoin(observables);
  }

  // update(preset: SolarSystemAcquisitionPresetInterface[]) {
  //   return this.http.put<SolarSystemAcquisitionPresetInterface[]>(`${this.configUrl}/${preset[0].id}/`, preset);
  // }

  delete(presetItems: SolarSystemAcquisitionPresetInterface[]) {
    const observables: Observable<void>[] = presetItems.map(preset =>
      this.http.delete<void>(`${this.configUrl}/${preset.id}`)
    );

    return forkJoin(observables);
  }
}
