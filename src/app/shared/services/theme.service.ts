import { Injectable } from "@angular/core";
import { WindowRefService } from "@shared/services/window-ref.service";
import { CookieService } from "ngx-cookie-service";
import { Constants } from "@shared/constants";

declare const VERSION: string;

export enum Theme {
  DEFAULT = "default",
  HIGH_CONTRAST = "high-contrast"
}

@Injectable({
  providedIn: "root"
})
export class ThemeService {
  theme = Theme.DEFAULT;

  constructor(public readonly windowRef: WindowRefService, public readonly cookieService: CookieService) {}

  setTheme(): void {
    const cookie = this.cookieService.get(Constants.USE_HIGH_CONTRAST_THEME_COOKIE);
    const theme = cookie ? Theme.HIGH_CONTRAST : Theme.DEFAULT;
    const head = document.getElementsByTagName("head")[0];
    const currentLink = this.windowRef.nativeWindow.document.getElementById("astrobin-theme");
    const newLink = this.windowRef.nativeWindow.document.createElement("link");

    newLink.id = "astrobin-theme";
    newLink.type = "text/css";
    newLink.rel = "stylesheet";
    newLink.href = `/assets/themes/${theme}.css?build=${VERSION}`;

    head.appendChild(newLink);

    if (currentLink) {
      setTimeout(() => {
        currentLink.parentElement.removeChild(currentLink);
      }, 100);
    }
  }
}
