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
  private _maps: maps;
  private _loaded = false;

  public constructor(public readonly loadingService: LoadingService, public readonly windowRef: WindowRefService) {
    super(loadingService);

  }

  get maps(): maps {
    return this._maps;
  }

  loadGoogleMaps(): Promise<void> {
    return new Promise((resolve, reject) => {
      if (this._loaded) {
        resolve();
        return;
      }

      const script = document.createElement('script');
      script.src = `https://maps.googleapis.com/maps/api/js?key=AIzaSyD-yl2h4BvziVebLTTawv9a6DKFky5O2eU`;
      script.onload = () => {
        if ((this.windowRef.nativeWindow as any)?.google !== undefined) {
          this._maps = (this.windowRef.nativeWindow as any).google.maps;
          this._loaded = true;
          resolve();
        } else {
          reject("Google Maps API not available");
        }
      };
      script.onerror = (error) => reject(error);
      document.body.appendChild(script);
    });
  }

  createGeocoder(): google.maps.Geocoder {
    if (!this.maps) {
      throw new Error("Google Maps API not loaded");
    }

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
