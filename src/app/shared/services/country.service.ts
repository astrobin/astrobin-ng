import * as countries from "i18n-iso-countries";
import english from "i18n-iso-countries/langs/en.json";
import french from "i18n-iso-countries/langs/fr.json";
import italian from "i18n-iso-countries/langs/it.json";
import spanish from "i18n-iso-countries/langs/es.json";
import german from "i18n-iso-countries/langs/de.json";
import portuguese from "i18n-iso-countries/langs/pt.json";
import russian from "i18n-iso-countries/langs/ru.json";
import { BaseService } from "@shared/services/base.service";
import { Injectable } from "@angular/core";

countries.registerLocale(english);
countries.registerLocale(french);
countries.registerLocale(italian);
countries.registerLocale(spanish);
countries.registerLocale(german);
countries.registerLocale(portuguese);
countries.registerLocale(russian);

@Injectable({
  providedIn: "root"
})
export class CountryService extends BaseService {
  getCountryName(countryCode: string, locale: string = "en"): string {
    return countries.getName(countryCode, locale);
  }

  getCountries(locale: string = "en"): { code: string, name: string }[] {
    const countryCodes = countries.getAlpha2Codes();
    const countryNames = countries.getNames(locale);

    return Object.keys(countryCodes).map(code => ({
      code: code,
      name: countryNames[code]
    }));
  }
}
