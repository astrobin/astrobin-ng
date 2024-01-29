import { Inject, Injectable, PLATFORM_ID } from "@angular/core";
import { isPlatformBrowser } from "@angular/common";
import { LoadingService } from "@shared/services/loading.service";

@Injectable({
  providedIn: "root"
})
export class GeolocationService {
  constructor(
    @Inject(PLATFORM_ID) public readonly platformId: Object,
    public readonly loadingService: LoadingService
  ) {
  }

  getCurrentPosition(): Promise<GeolocationPosition> {
    this.loadingService.setLoading(true);

    return new Promise((resolve, reject) => {
      if (!isPlatformBrowser(this.platformId)) {
        reject('Geolocation is not available in server-side rendering.');
        this.loadingService.setLoading(false);
        return;
      }

      if (!navigator.geolocation) {
        reject("Geolocation is not supported by your browser.");
      } else {
        navigator.geolocation.getCurrentPosition(resolve, reject);
      }

      this.loadingService.setLoading(false);
    });
  }
}
