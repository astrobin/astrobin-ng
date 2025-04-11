import { HttpClient, HttpHeaders } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { BaseService } from "@core/services/base.service";
import { LoadingService } from "@core/services/loading.service";
import * as countries from "i18n-iso-countries";
import arabic from "i18n-iso-countries/langs/ar.json";
import german from "i18n-iso-countries/langs/de.json";
import greek from "i18n-iso-countries/langs/el.json";
import english from "i18n-iso-countries/langs/en.json";
import spanish from "i18n-iso-countries/langs/es.json";
import finnish from "i18n-iso-countries/langs/fi.json";
import french from "i18n-iso-countries/langs/fr.json";
import hungarian from "i18n-iso-countries/langs/hu.json";
import italian from "i18n-iso-countries/langs/it.json";
import japanese from "i18n-iso-countries/langs/ja.json";
import dutch from "i18n-iso-countries/langs/nl.json";
import polish from "i18n-iso-countries/langs/pl.json";
import portuguese from "i18n-iso-countries/langs/pt.json";
import russian from "i18n-iso-countries/langs/ru.json";
import albanian from "i18n-iso-countries/langs/sq.json";
import turkish from "i18n-iso-countries/langs/tr.json";
import ukrainian from "i18n-iso-countries/langs/uk.json";
import chinese from "i18n-iso-countries/langs/zh.json";
import { Observable, of } from "rxjs";
import { map } from "rxjs/operators";

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
    public readonly http: HttpClient
  ) {
    super(loadingService);
  }

  getCountryContinent(countryCode: string): Observable<string> {
    if (countryCode === null) {
      return null;
    }

    const continent = this.cachedContinentsMap.get(countryCode);
    if (continent !== null) {
      return of(continent);
    }

    return this.http
      .get(`https://restcountries.com/v3.1/alpha/${countryCode}`, {
        headers: new HttpHeaders({ timeout: `${500}` })
      })
      .pipe(
        map((response: any) => {
          if (response !== null && response[0] !== null && response[0].region !== null) {
            let continent = response[0].region;

            if (continent === "Americas") {
              continent = response[0].subregion;
            }

            this.cachedContinentsMap.set(countryCode, continent);
            return continent;
          }
          return null;
        })
      );
  }

  getCountryName(countryCode: string, locale = "en"): string {
    locale = this._simplifyLocale(locale);
    return countries.getName(countryCode, locale, { select: "alias" });
  }

  getCountries(locale = "en"): { code: string; name: string }[] {
    if (locale === null) {
      locale = "en";
    }

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
