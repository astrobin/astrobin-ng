import { isPlatformBrowser } from "@angular/common";
import { Inject, Injectable, PLATFORM_ID } from "@angular/core";
import { BaseService } from "@core/services/base.service";
import { LoadingService } from "@core/services/loading.service";
import { UtilsService } from "@core/services/utils/utils.service";
import type { CookieConsentEnum } from "@core/types/cookie-consent.enum";
import { Constants } from "@shared/constants";
import { CookieService } from "ngx-cookie";

@Injectable({
  providedIn: "root"
})
export class CookieConsentService extends BaseService {
  constructor(
    public readonly loadingService: LoadingService,
    public readonly cookieService: CookieService,
    @Inject(PLATFORM_ID) public readonly platformId
  ) {
    super(loadingService);
  }

  private static _parseCookieStr(cookie: string): { [key: string]: string } {
    const dic: { [key: string]: string } = {};

    if (!cookie) {
      return dic;
    }

    for (const c of UtilsService.removeQuotes(cookie).split("|")) {
      const [key, value] = c.split("=");
      dic[key] = value;
    }
    return dic;
  }

  public cookieGroupAccepted(consentType: CookieConsentEnum): boolean {
    return this._getCookieValue(consentType) ?? false;
  }

  private _getConsentCookie(): { [key: string]: string } | null {
    const cookie = this.cookieService.get(Constants.COOKIE_CONSENT_COOKIE);
    return CookieConsentService._parseCookieStr(cookie);
  }

  private _getCookieValue(consentType: CookieConsentEnum): boolean | null {
    if (!isPlatformBrowser(this.platformId)) {
      return false;
    }

    const cookieDict: { [key: string]: string } | null = this._getConsentCookie();

    if (UtilsService.isNotEmptyDictionary(cookieDict)) {
      return cookieDict[consentType] !== Constants.COOKIE_CONSENT_DECLINE;
    }

    return null;
  }
}
