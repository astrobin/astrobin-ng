import { Injectable } from "@angular/core";
import { BaseService } from "@shared/services/base.service";
import { LoadingService } from "@shared/services/loading.service";
import { WindowRefService } from "@shared/services/window-ref.service";
import { google } from "@google/maps";

// @ts-ignore
type maps = google.maps;

@Injectable({
  providedIn: "root"
})
export class GoogleMapsService extends BaseService {
  private readonly _maps: maps;

  public constructor(public readonly loadingService: LoadingService, public readonly windowRef: WindowRefService) {
    super(loadingService);

    if ((windowRef.nativeWindow as any)?.google !== undefined) {
      this._maps = (windowRef.nativeWindow as any).google.maps;
    }
  }

  get maps(): maps {
    return this._maps;
  }

  createGeocoder(): google.maps.Geocoder {
    return new this.maps.Geocoder();
  }


  getCityFromAddressComponent(addressComponents: any): string {
    for (let component of addressComponents) {
      if (component.types.includes("locality")) {
        return component.long_name;
      }
    }

    for (let component of addressComponents) {
      if (component.types.includes("postal_town")) {
        return component.long_name;
      }
    }

    for (let component of addressComponents) {
      if (component.types.includes("administrative_area_level_2")) {
        return component.long_name;
      }
    }

    for (let component of addressComponents) {
      if (component.types.includes("sublocality")) {
        return component.long_name;
      }
    }

    return null;
  }

  getRegionFromAddressComponent(addressComponents: any): string {
    for (let component of addressComponents) {
      if (component.types.includes("administrative_area_level_1")) {
        return component.short_name;
      }
    }

    for (let component of addressComponents) {
      if (component.types.includes("administrative_area_level_2")) {
        return component.short_name;
      }
    }

    return null;
  }

  getCountryFromAddressComponent(addressComponents: any): string {
    for (let component of addressComponents) {
      if (component.types.includes("country")) {
        return component.short_name;
      }
    }

    return null;
  }
}
