import { Injectable } from "@angular/core";
import { BaseService } from "@shared/services/base.service";
import { LoadingService } from "@shared/services/loading.service";
import { WindowRefService } from "@shared/services/window-ref.service";

// @ts-ignore
type maps = google.maps;

@Injectable({
  providedIn: "root"
})
export class GoogleMapsService extends BaseService {
  private readonly _maps: maps;

  public constructor(public readonly loadingService: LoadingService, public readonly windowRef: WindowRefService) {
    super(loadingService);

    this._maps = (windowRef.nativeWindow as any).google.maps;
  }

  get maps(): maps {
    return this._maps;
  }

  createGeocoder(): google.maps.Geocoder {
    return new this.maps.Geocoder();
  }
}
