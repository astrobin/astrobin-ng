import { Injectable } from "@angular/core";
import { WindowRefService } from "@shared/services/window-ref.service";
import { CookieService } from "ngx-cookie-service";
import { Constants } from "@shared/constants";
import { environment } from "@env/environment";
import { take } from "rxjs/operators";
import { interval } from "rxjs";
import { UtilsService } from "@shared/services/utils/utils.service";

export enum Theme {
  DEFAULT = "default",
  HIGH_CONTRAST = "high-contrast"
}

@Injectable({
  providedIn: "root"
})
export class ThemeService {
  theme = Theme.DEFAULT;

  constructor(
    public readonly windowRef: WindowRefService,
    public readonly cookieService: CookieService,
    public readonly utilsService: UtilsService
  ) {}

  currentTheme(): Theme {
    const cookie = this.cookieService.get(Constants.USE_HIGH_CONTRAST_THEME_COOKIE);
    return cookie ? Theme.HIGH_CONTRAST : Theme.DEFAULT;
  }

  setTheme(): void {
    const document = this.windowRef.nativeWindow.document;
    const theme = this.currentTheme();
    const head = document.getElementsByTagName("head")[0];
    const body = document.getElementsByTagName("body")[0];
    const currentLink = this.windowRef.nativeWindow.document.getElementById("astrobin-theme");
    const newLink = this.windowRef.nativeWindow.document.createElement("link");

    newLink.id = "astrobin-theme";
    newLink.type = "text/css";
    newLink.rel = "stylesheet";
    newLink.href = `/assets/themes/${theme}.css?build=${environment.buildVersion}`;

    head.appendChild(newLink);

    if (theme === Theme.HIGH_CONTRAST) {
      if (!body.classList.contains("high-contrast")) {
        body.classList.add("high-contrast");
      }
    } else {
      body.classList.remove("high-contrast");
    }

    if (currentLink) {
      this.utilsService.delay(100).subscribe(() => {
        currentLink.parentElement.removeChild(currentLink);
      });
    }
  }
}
