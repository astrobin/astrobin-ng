import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { ImageInterface } from "@shared/interfaces/image.interface";
import { BaseClassicApiService } from "@shared/services/api/classic/base-classic-api.service";
import { LoadingService } from "@shared/services/loading.service";
import { Observable } from "rxjs";
import { ImageApiServiceInterface } from "./image-api.service-interface";

@Injectable({
  providedIn: "root"
})
export class ImageApiService extends BaseClassicApiService implements ImageApiServiceInterface {
  configUrl = this.baseUrl + "/images";

  constructor(public loadingService: LoadingService, private http: HttpClient) {
    super(loadingService);
  }

  getImage(id: number): Observable<ImageInterface> {
    return this.http.get<ImageInterface>(`${this.configUrl}/image/${id}/`);
  }
}
