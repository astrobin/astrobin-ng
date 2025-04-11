import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { BaseClassicApiService } from "@core/services/api/classic/base-classic-api.service";
import { LoadingService } from "@core/services/loading.service";
import { SavedSearchInterface } from "@features/search/interfaces/saved-search.interface";
import { Observable } from "rxjs";

@Injectable({
  providedIn: "root"
})
export class SavedSearchApiService extends BaseClassicApiService {
  configUrl = this.baseUrl + "/astrobin/saved-search";

  constructor(
    public loadingService: LoadingService,
    public readonly http: HttpClient
  ) {
    super(loadingService);
  }

  load(): Observable<SavedSearchInterface[]> {
    return this.http.get<SavedSearchInterface[]>(`${this.configUrl}/`);
  }

  save(name: string, params: string): Observable<SavedSearchInterface> {
    return this.http.post<SavedSearchInterface>(`${this.configUrl}/`, { name, params });
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.configUrl}/${id}/`);
  }
}
