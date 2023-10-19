import * as countries from "i18n-iso-countries";
import english from "i18n-iso-countries/langs/en.json";
import french from "i18n-iso-countries/langs/fr.json";
import { BaseService } from "@shared/services/base.service";
import { Injectable } from "@angular/core";

countries.registerLocale(english);
countries.registerLocale(french);

@Injectable({
  providedIn: "root"
})
export class CountryService extends BaseService {
  getCountryName(countryCode: string, locale: string = "en"): string {
    return countries.getName(countryCode, locale);
  }
}
