import { Inject, Injectable, PLATFORM_ID } from "@angular/core";
import { isPlatformBrowser, isPlatformServer } from "@angular/common";
import { Capacitor } from "@capacitor/core";

@Injectable({
  providedIn: "root"
})
export class PlatformService {
  public readonly isBrowser: boolean;
  public readonly isServer: boolean;
  public readonly isNative: boolean;

  constructor(
    @Inject(PLATFORM_ID) private platformId: Object
  ) {
    this.isBrowser = isPlatformBrowser(platformId);
    this.isServer = isPlatformServer(platformId);
    this.isNative = Capacitor.isNativePlatform();
  }

  canAccessDOM(): boolean {
    return this.isBrowser || this.isNative;
  }
}
