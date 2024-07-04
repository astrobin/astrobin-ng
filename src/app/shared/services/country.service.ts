import * as countries from "i18n-iso-countries";
import english from "i18n-iso-countries/langs/en.json";
import german from "i18n-iso-countries/langs/de.json";
import spanish from "i18n-iso-countries/langs/es.json";
import french from "i18n-iso-countries/langs/fr.json";
import italian from "i18n-iso-countries/langs/it.json";
import portuguese from "i18n-iso-countries/langs/pt.json";
import chinese from "i18n-iso-countries/langs/zh.json";
import arabic from "i18n-iso-countries/langs/ar.json";
import greek from "i18n-iso-countries/langs/el.json";
import finnish from "i18n-iso-countries/langs/fi.json";
import japanese from "i18n-iso-countries/langs/ja.json";
import hungarian from "i18n-iso-countries/langs/hu.json";
import dutch from "i18n-iso-countries/langs/nl.json";
import polish from "i18n-iso-countries/langs/pl.json";
import ukrainian from "i18n-iso-countries/langs/uk.json";
import russian from "i18n-iso-countries/langs/ru.json";
import albanian from "i18n-iso-countries/langs/sq.json";
import turkish from "i18n-iso-countries/langs/tr.json";
import { BaseService } from "@shared/services/base.service";
import { Injectable } from "@angular/core";
import { Observable, of } from "rxjs";
import { map } from "rxjs/operators";
import { HttpClient } from "@angular/common/http";
import { LoadingService } from "@shared/services/loading.service";

countries.registerLocale(english);
countries.registerLocale(german);
countries.registerLocale(spanish);
countries.registerLocale(french);
countries.registerLocale(italian);
countries.registerLocale(portuguese);
countries.registerLocale(chinese);
countries.registerLocale(arabic);
countries.registerLocale(greek);
countries.registerLocale(finnish);
countries.registerLocale(japanese);
countries.registerLocale(hungarian);
countries.registerLocale(dutch);
countries.registerLocale(polish);
countries.registerLocale(ukrainian);
countries.registerLocale(russian);
countries.registerLocale(albanian);
countries.registerLocale(turkish);

@Injectable({
  providedIn: "root"
})
export class CountryService extends BaseService {
  readonly cachedContinentsMap: Map<string, string> = new Map<string, string>();

  constructor(
    public readonly loadingService: LoadingService,
    public readonly http: HttpClient) {
    super(loadingService);
  }

  getCountryContinent(countryCode: string): Observable<string> {
    if (countryCode == null) {
      return null;
    }

    const continent = this.cachedContinentsMap.get(countryCode);
    if (continent != null) {
      return of(continent);
    }

    return this.http.get(`https://restcountries.com/v3.1/alpha/${countryCode}`).pipe(
      map((response: any) => {
        if (response != null && response[0] != null && response[0].region != null) {
          const continent = response[0].region;
          this.cachedContinentsMap.set(countryCode, continent);
          return continent;
        }
        return null;
      })
    );
  }

  getCountryName(countryCode: string, locale: string = "en"): string {
    locale = this._simplifyLocale(locale);
    return countries.getName(countryCode, locale, { select: "alias" });
  }

  getCountries(locale: string = "en"): { code: string, name: string }[] {
    locale = this._simplifyLocale(locale);

    const countryCodes = countries.getAlpha2Codes();
    const countryNames = countries.getNames(locale, { select: "alias" });

    return Object.keys(countryCodes).map(code => ({
      code: code,
      name: countryNames[code]
    }));
  }

  private _simplifyLocale(locale: string): string {
    if (locale.indexOf("-") !== -1) {
      return locale.split("-")[0];
    }
    return locale;
  }
}
