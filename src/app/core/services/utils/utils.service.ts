import { isPlatformBrowser, isPlatformServer } from "@angular/common";
import type { ElementRef, Renderer2 } from "@angular/core";
import { Inject, Injectable, PLATFORM_ID } from "@angular/core";
import type { MainState } from "@app/store/state";
import type { PopNotificationsService } from "@core/services/pop-notifications.service";
import type { WindowRefService } from "@core/services/window-ref.service";
import type { Store } from "@ngrx/store";
import type { SelectorWithProps } from "@ngrx/store/src/models";
import type { FormlyFieldConfig } from "@ngx-formly/core";
import type { TranslateService } from "@ngx-translate/core";
import { Constants } from "@shared/constants";
import { Buffer } from "buffer";
import msgpack from "msgpack-lite";
import type { CookieService } from "ngx-cookie";
import pako from "pako";
import { interval, Observable, of } from "rxjs";
import { distinctUntilChanged, switchMap, take } from "rxjs/operators";

interface CachedRect {
  rect: DOMRect;
  timestamp: number;
}

export interface ViewportCheckOptions {
  shouldCheckVertical?: boolean;
  shouldCheckHorizontal?: boolean;
  verticalTolerance?: number;
  horizontalTolerance?: number;
}

@Injectable({
  providedIn: "root"
})
export class UtilsService {
  private _rectCache = new Map<HTMLElement, CachedRect>();
  private readonly RECT_CACHE_DURATION = 1000; // 1 second

  constructor(
    public readonly store$: Store<MainState>,
    public readonly translateService: TranslateService,
    public readonly cookieService: CookieService,
    @Inject(PLATFORM_ID) public readonly platformId
  ) {}

  static divmod(a: number, b: number): [number, number] {
    const quotient = Math.floor(a / b);
    const remainder = a - quotient * b;
    return [quotient, remainder];
  }

  static padNumber(num: number, size = 2): string {
    let s = num + "";
    while (s.length < size) {
      s = "0" + s;
    }
    return s;
  }

  static removeQuotes(str: string): string {
    if (str.length >= 2 && str.startsWith('"') && str.endsWith('"')) {
      return str.slice(1, -1);
    }
    return str;
  }

  static getDateFormatString(lang = "default") {
    const formatObj = new Intl.DateTimeFormat(lang).formatToParts(new Date());

    return formatObj
      .map(obj => {
        switch (obj.type) {
          case "day":
            return "DD";
          case "month":
            return "MM";
          case "year":
            return "YYYY";
          default:
            return obj.value;
        }
      })
      .join("");
  }

  static uuid(): string {
    const S4 = (): string => {
      // eslint-disable-next-line no-bitwise
      return (((1 + Math.random()) * 0x10000) | 0).toString(16).substring(1);
    };

    return `${S4()}${S4()}-${S4()}-${S4()}-${S4()}-${S4()}${S4()}${S4()}`;
  }

  static fileExtension(filename: string): string | undefined {
    const separator = ".";

    if (!filename || filename.indexOf(separator) === -1) {
      return undefined;
    }

    return filename.split(separator).pop();
  }

  static isImage(filename: string): boolean {
    if (!filename) {
      return false;
    }

    const extension = UtilsService.fileExtension(filename).toLowerCase();
    return ["png", "jpg", "jpeg", "gif"].indexOf(extension) > -1;
  }

  static isVideo(filename: string): boolean {
    if (!filename) {
      return false;
    }

    const extension = UtilsService.fileExtension(filename).toLowerCase();
    return ["mov", "avi", "mp4", "mpeg"].indexOf(extension) > -1;
  }

  /**
   * Removes duplicates from an array. Items must be able to be stringified using JSON, or a key must be provided.
   */
  static arrayUniqueObjects(array: any[], key?: string, reverse = true): any[] {
    if (!Array.isArray(array) || array.length === 0) {
      return array;
    }

    let copy = array.concat();

    if (reverse) {
      copy = array.reverse();
    }

    if (key) {
      const seen = new Set();
      copy = copy.filter(item => {
        const keyValue = item[key];
        if (seen.has(keyValue)) {
          return false;
        }
        seen.add(keyValue);
        return true;
      });
    } else {
      const seen = new Map();
      copy = copy.filter(item => {
        const itemJson = JSON.stringify(item);
        if (seen.has(itemJson)) {
          return false;
        }
        seen.set(itemJson, true);
        return true;
      });
    }

    return copy;
  }

  static getLinksInText(text: string): string[] {
    const regex = /href="(.*?)"/gm;
    let m;
    const links = [];

    // eslint-disable-next-line no-cond-assign
    while ((m = regex.exec(text)) !== null) {
      // This is necessary to avoid infinite loops with zero-width matches
      if (m.index === regex.lastIndex) {
        regex.lastIndex++;
      }

      // The result can be accessed through the `m`-variable.
      m.forEach((match, groupIndex) => {
        if (match.indexOf("href") !== 0) {
          links.push(match);
        }
      });
    }

    return links;
  }

  static openLink(document: any, url: string, options: { openInNewTab?: boolean } = {}) {
    Object.assign(document.createElement("a"), {
      target: !!options && options.openInNewTab ? "_blank" : "_self",
      href: url
    }).click();
  }

  static addOrUpdateUrlParam(url: string, name: string, value: string): string {
    // Regular expression to find the parameter in the URL
    let regex = new RegExp(`[&\?]${name}=`);

    // Check if the URL already contains the parameter
    if (regex.test(url)) {
      regex = new RegExp(`([&\?])${name}=[^&]+`);
      return url.replace(regex, `$1${name}=${value}`);
    }

    // Check if the URL contains a fragment identifier
    const hashIndex = url.indexOf("#");
    if (hashIndex > -1) {
      // Split the URL into two parts: before and after the '#'
      const baseUrl = url.substring(0, hashIndex);
      const hashUrl = url.substring(hashIndex);

      if (baseUrl.indexOf("?") > -1) {
        // If there is already a query string, append the new parameter
        return `${baseUrl}&${name}=${value}${hashUrl}`;
      } else {
        // If there is no query string, add one
        return `${baseUrl}?${name}=${value}${hashUrl}`;
      }
    } else {
      // Handle URLs without a fragment identifier
      if (url.indexOf("?") > -1) {
        return `${url}&${name}=${value}`;
      } else {
        return `${url}?${name}=${value}`;
      }
    }
  }

  static removeUrlParam(url: string, parameter: string): string {
    const urlParts = url.split("?");

    if (urlParts.length >= 2) {
      const prefix = encodeURIComponent(parameter) + "=";
      const pars = urlParts[1].split(/[&;]/g);

      for (let i = pars.length; i-- > 0; ) {
        if (pars[i].lastIndexOf(prefix, 0) !== -1) {
          pars.splice(i, 1);
        }
      }

      return urlParts[0] + (pars.length > 0 ? "?" + pars.join("&") : "");
    }

    return url;
  }

  static getUrlParam(url: string, parameter: string): string | null {
    const paramString = url.split("?")[1];
    const queryString = new URLSearchParams(paramString);
    return queryString.get(parameter);
  }

  static toQueryString(params: { [key: string]: any }): string {
    return Object.keys(params)
      .map(key => {
        const value = params[key];
        if (value === null || value === undefined) {
          return "";
        }
        if (UtilsService.isArray(value) || UtilsService.isObject(value)) {
          return `${encodeURIComponent(key)}=${encodeURIComponent(JSON.stringify(value))}`;
        }
        return `${encodeURIComponent(key)}=${encodeURIComponent(value)}`;
      })
      .filter(param => param !== "")
      .join("&");
  }

  static compressQueryString(queryString: string): string {
    if (typeof queryString !== "string") {
      throw new TypeError("Input must be a string");
    }

    const buffer = msgpack.encode(queryString);
    const compressed = pako.deflate(buffer);
    return Buffer.from(compressed).toString("base64");
  }

  static decompressQueryString(compressedParams: string): string {
    const compressed = Buffer.from(compressedParams, "base64");
    const decompressed = pako.inflate(compressed);
    return msgpack.decode(decompressed);
  }

  static parseQueryString(queryString: string): { [key: string]: any } {
    const params: { [key: string]: any } = {};
    if (!queryString) {
      return params;
    }

    const pairs = queryString[0] === "?" ? queryString.substring(1) : queryString;

    pairs.split("&").forEach(pair => {
      if (!pair) {
        return;
      } // Skip empty pairs

      const [key, value] = pair.split("=");
      const decodedKey = decodeURIComponent(key);
      const decodedValue = value !== undefined ? decodeURIComponent(value) : null;

      // Handle array values
      if (params[decodedKey]) {
        if (Array.isArray(params[decodedKey])) {
          params[decodedKey].push(decodedValue);
        } else {
          params[decodedKey] = [params[decodedKey], decodedValue];
        }
      } else {
        params[decodedKey] = decodedValue;
      }
    });

    return params;
  }

  static isNumeric(s: string): boolean {
    return !!s && /^[-+]?\d+\.\d+$|^[-+]?\d+$/.test(s);
  }

  static isString(s: any): boolean {
    return !!s && Object.prototype.toString.call(s) === "[object String]";
  }

  static isFunction(functionToCheck): boolean {
    return functionToCheck && {}.toString.call(functionToCheck) === "[object Function]";
  }

  static isObject(obj): boolean {
    return obj !== null && obj.constructor.name === "Object";
  }

  static isArray(obj): boolean {
    return obj !== null && obj.constructor.name === "Array";
  }

  static isNotEmptyDictionary<T>(variable: T | null | undefined): boolean {
    if (variable === null || variable === undefined) {
      return false;
    }

    return !(typeof variable === "object" && Object.keys(variable).length === 0);
  }

  static isNullOrEmpty(array) {
    return !array || array.length === 0;
  }

  static isUrl(s: string): boolean {
    const regex = /(https?:\/\/)?(www\.)?[-a-zA-Z0-9@:%._\+~#=]{2,256}\.[a-z]{2,6}\b([-a-zA-Z0-9@:%_\+.~#()?&//=]*)/;

    return regex.test(s);
  }

  static camelCaseToSentenceCase(s: string): string {
    if (!s) {
      return "";
    }

    const result = s.replace(/([A-Z])/g, " $1");
    return result.charAt(0).toUpperCase() + result.slice(1);
  }

  static camelCaseToSnakeCase(s: string): string {
    if (!s) {
      return "";
    }

    return s
      .split(/(?=[A-Z])/)
      .join("_")
      .toLowerCase();
  }

  static camelCaseToCapsCase(s: string): string {
    if (!s) {
      return "";
    }

    return UtilsService.camelCaseToSnakeCase(s).toUpperCase();
  }

  static toCamelCase(s: string): string {
    if (!s) {
      return "";
    }

    return s.replace(/([-_][a-z])/gi, $1 => {
      return $1.toUpperCase().replace("-", "").replace("_", "");
    });
  }

  static objectToCamelCase(obj: any): any {
    if (typeof obj !== "object" || obj === null || obj === undefined) {
      return obj;
    }

    if (obj instanceof Array) {
      return obj.map(UtilsService.objectToCamelCase);
    }

    return Object.keys(obj)
      .filter(prop => obj.hasOwnProperty(prop))
      .map(prop => ({ [UtilsService.toCamelCase(prop)]: UtilsService.objectToCamelCase(obj[prop]) }))
      .reduce((prev, current) => ({ ...prev, ...current }));
  }

  static objectToSnakeCase(obj: any): any {
    if (typeof obj !== "object" || obj === null || obj === undefined) {
      return obj;
    }

    if (obj instanceof Array) {
      return obj.map(UtilsService.objectToSnakeCase);
    }

    return Object.keys(obj)
      .filter(prop => obj.hasOwnProperty(prop))
      .map(prop => ({ [UtilsService.camelCaseToSnakeCase(prop)]: UtilsService.objectToSnakeCase(obj[prop]) }))
      .reduce((prev, current) => ({ ...prev, ...current }));
  }

  static ensureUrlProtocol(url: string): string {
    if (url && url.indexOf("://") === -1) {
      return `http://${url}`;
    }

    return url;
  }

  static shortenUrl(url: string) {
    const sanitized = UtilsService.ensureUrlProtocol(url)
      .replace("www.", "") // remove the www part
      .replace(/\/+/g, "/") // replace consecutive slashes with a single slash
      .replace(/\/+$/, ""); // remove trailing slashes

    const urlObject = new URL(sanitized);
    const hostname = urlObject.hostname;
    const path = urlObject.pathname;
    const lastElement = path.split("/").pop();

    if (lastElement) {
      return `${hostname}/.../${lastElement}`;
    }

    return hostname;
  }

  static slugify(s: string): string {
    if (!s) {
      return "";
    }

    return s
      .toString()
      .toLowerCase()
      .replace(/\s+/g, "-") // Replace spaces with -
      .replace(/_/g, "-") // Replace _ with -
      .replace(/[^\w\-]+/g, "") // Remove all non-word chars
      .replace(/\-\-+/g, "-") // Replace multiple - with single -
      .replace(/^-+/, "") // Trim - from start of text
      .replace(/-+$/, ""); // Trim - from end of text
  }

  static sortParent(
    array: { id: number; parent: number; [key: string]: any }[],
    parent: any = null
  ): { id: number; parent: number; [key: string]: any }[] {
    if (!array) {
      return array;
    }

    const arrayCopy = [...array].reverse();
    let result: { id: number; parent: number; [key: string]: any }[] = [];
    let i = arrayCopy.length;

    while (i--) {
      const item = arrayCopy[i];

      if (item.parent === parent) {
        result.push(item);
        arrayCopy.splice(i, 1);
        result = [...result, ...UtilsService.sortParent(arrayCopy, item.id)];
      }
    }

    return result;
  }

  static sortObjectsByProperty<T>(array: T[], property: string): T[] {
    return array.sort((a: T, b: T) => {
      if (a[property] < b[property]) {
        return -1;
      }

      if (a[property] > b[property]) {
        return 1;
      }

      return 0;
    });
  }

  static async fileFromUrl(url: string): Promise<File> {
    const response = await fetch(url + "?cache-block=true");
    const data = await response.blob();
    const name = url.substring(url.lastIndexOf("/") + 1);
    return new File([data], name);
  }

  static fullFieldPath(fieldConfig: FormlyFieldConfig): string[] {
    const path: string[] = [];

    // Start with the current field
    if (fieldConfig.props && fieldConfig.props.label) {
      path.unshift(fieldConfig.props.label);
    }

    // Traverse up the tree
    let currentFieldConfig = fieldConfig;
    while (currentFieldConfig.parent) {
      currentFieldConfig = currentFieldConfig.parent;

      if (currentFieldConfig.templateOptions && currentFieldConfig.props.label) {
        path.unshift(currentFieldConfig.props.label);
      }
    }

    return path;
  }

  static notifyAboutFieldsWithErrors(
    topFields: FormlyFieldConfig[],
    popNotificationsService: PopNotificationsService,
    translateService: TranslateService
  ) {
    const errorList: string[] = UtilsService.fieldsWithErrors(topFields).map(
      field => `<li><strong>${UtilsService.fullFieldPath(field).join(" / ")}</strong>`
    );

    popNotificationsService.error(
      `
        <p>
          ${translateService.instant("The following form fields have errors, please correct them and try again:")}
        </p>
        <ul>
          ${errorList.join("\n")}
        </ul>
        `,
      null,
      {
        enableHtml: true
      }
    );

    return;
  }

  static fieldsWithErrors(topFields: FormlyFieldConfig[]): FormlyFieldConfig[] {
    let errored = [];

    topFields.forEach(field => {
      if (field.fieldGroup !== undefined) {
        errored = [...errored, ...UtilsService.fieldsWithErrors(field.fieldGroup)];
      } else {
        if (field.formControl.invalid) {
          errored.push(field);
        }
      }
    });

    return errored;
  }

  static countNonNullProperties(obj: any, excludeProps: string[] = []) {
    let count = 0;

    for (const prop in obj) {
      if (excludeProps.includes(prop)) {
        continue;
      }

      if (obj[prop] !== null && obj[prop] !== undefined && obj[prop] !== false) {
        count++;
      }
    }

    return count;
  }

  static isEuropeanCountry(countryCode: string): boolean {
    const europeanCountries = [
      "AL", // Albania
      "AD", // Andorra
      "AM", // Armenia (partially in Europe)
      "AT", // Austria
      "AZ", // Azerbaijan (partially in Europe)
      "BY", // Belarus
      "BE", // Belgium
      "BA", // Bosnia and Herzegovina
      "BG", // Bulgaria
      "HR", // Croatia
      "CY", // Cyprus (partially in Europe)
      "CZ", // Czech Republic
      "DK", // Denmark
      "EE", // Estonia
      "FI", // Finland
      "FR", // France
      "GE", // Georgia (partially in Europe)
      "DE", // Germany
      "GR", // Greece
      "HU", // Hungary
      "IS", // Iceland
      "IE", // Ireland
      "IT", // Italy
      "KZ", // Kazakhstan (partially in Europe)
      "XK", // Kosovo
      "LV", // Latvia
      "LI", // Liechtenstein
      "LT", // Lithuania
      "LU", // Luxembourg
      "MT", // Malta
      "MD", // Moldova
      "MC", // Monaco
      "ME", // Montenegro
      "NL", // Netherlands
      "MK", // North Macedonia
      "NO", // Norway
      "PL", // Poland
      "PT", // Portugal
      "RO", // Romania
      "RU", // Russia (partially in Europe)
      "SM", // San Marino
      "RS", // Serbia
      "SK", // Slovakia
      "SI", // Slovenia
      "ES", // Spain
      "SE", // Sweden
      "CH", // Switzerland
      "TR", // Turkey (partially in Europe)
      "UA", // Ukraine
      "GB", // United Kingdom
      "VA" // Vatican City
    ];

    return europeanCountries.includes(countryCode.toUpperCase());
  }

  static isNorthAmericanCountry(countryCode: string): boolean {
    const northAmericanCountries = [
      "AG", // Antigua and Barbuda
      "BS", // Bahamas
      "BB", // Barbados
      "BZ", // Belize
      "CA", // Canada
      "CR", // Costa Rica
      "CU", // Cuba
      "DM", // Dominica
      "DO", // Dominican Republic
      "SV", // El Salvador
      "GD", // Grenada
      "GT", // Guatemala
      "HT", // Haiti
      "HN", // Honduras
      "JM", // Jamaica
      "MX", // Mexico
      "NI", // Nicaragua
      "PA", // Panama
      "KN", // Saint Kitts and Nevis
      "LC", // Saint Lucia
      "VC", // Saint Vincent and the Grenadines
      "TT", // Trinidad and Tobago
      "US" // United States
    ];

    return northAmericanCountries.includes(countryCode.toUpperCase());
  }

  static isSouthAmericanCountry(countryCode: string): boolean {
    const southAmericanCountries = [
      "AR", // Argentina
      "BO", // Bolivia
      "BR", // Brazil
      "CL", // Chile
      "CO", // Colombia
      "EC", // Ecuador
      "GY", // Guyana
      "PY", // Paraguay
      "PE", // Peru
      "SR", // Suriname
      "UY", // Uruguay
      "VE" // Venezuela
    ];

    return southAmericanCountries.includes(countryCode.toUpperCase());
  }

  static isAsianCountry(countryCode: string): boolean {
    const asianCountries = [
      "AF", // Afghanistan
      "AM", // Armenia
      "AZ", // Azerbaijan
      "BH", // Bahrain
      "BD", // Bangladesh
      "BT", // Bhutan
      "BN", // Brunei
      "KH", // Cambodia
      "CN", // China
      "CY", // Cyprus
      "GE", // Georgia
      "IN", // India
      "ID", // Indonesia
      "IR", // Iran
      "IQ", // Iraq
      "IL", // Israel
      "JP", // Japan
      "JO", // Jordan
      "KZ", // Kazakhstan
      "KW", // Kuwait
      "KG", // Kyrgyzstan
      "LA", // Laos
      "LB", // Lebanon
      "MY", // Malaysia
      "MV", // Maldives
      "MN", // Mongolia
      "MM", // Myanmar
      "NP", // Nepal
      "KP", // North Korea
      "OM", // Oman
      "PK", // Pakistan
      "PS", // Palestine
      "PH", // Philippines
      "QA", // Qatar
      "SA", // Saudi Arabia
      "SG", // Singapore
      "KR", // South Korea
      "LK", // Sri Lanka
      "SY", // Syria
      "TW", // Republic of China (Taiwan)
      "TJ", // Tajikistan
      "TH", // Thailand
      "TL", // Timor-Leste
      "TR", // Turkey (partially in Asia)
      "TM", // Turkmenistan
      "AE", // United Arab Emirates
      "UZ", // Uzbekistan
      "VN", // Vietnam
      "YE" // Yemen
    ];

    return asianCountries.includes(countryCode.toUpperCase());
  }

  static isAfricanCountry(countryCode: string): boolean {
    const africanCountries = [
      "DZ", // Algeria
      "AO", // Angola
      "BJ", // Benin
      "BW", // Botswana
      "BF", // Burkina Faso
      "BI", // Burundi
      "CV", // Cape Verde
      "CM", // Cameroon
      "CF", // Central African Republic
      "TD", // Chad
      "KM", // Comoros
      "CG", // Congo
      "CD", // Democratic Republic of the Congo
      "DJ", // Djibouti
      "EG", // Egypt
      "GQ", // Equatorial Guinea
      "ER", // Eritrea
      "SZ", // Eswatini
      "ET", // Ethiopia
      "GA", // Gabon
      "GM", // Gambia
      "GH", // Ghana
      "GN", // Guinea
      "GW", // Guinea-Bissau
      "CI", // Ivory Coast
      "KE", // Kenya
      "LS", // Lesotho
      "LR", // Liberia
      "LY", // Libya
      "MG", // Madagascar
      "MW", // Malawi
      "ML", // Mali
      "MR", // Mauritania
      "MU", // Mauritius
      "MA", // Morocco
      "MZ", // Mozambique
      "NA", // Namibia
      "NE", // Niger
      "NG", // Nigeria
      "RW", // Rwanda
      "ST", // Sao Tome and Principe
      "SN", // Senegal
      "SC", // Seychelles
      "SL", // Sierra Leone
      "SO", // Somalia
      "ZA", // South Africa
      "SS", // South Sudan
      "SD", // Sudan
      "TZ", // Tanzania
      "TG", // Togo
      "TN", // Tunisia
      "UG", // Uganda
      "ZM", // Zambia
      "ZW" // Zimbabwe
    ];

    return africanCountries.includes(countryCode.toUpperCase());
  }

  static isOceaniaCountry(countryCode: string): boolean {
    const oceaniaCountries = [
      "AS", // American Samoa
      "AU", // Australia
      "CK", // Cook Islands
      "FJ", // Fiji
      "PF", // French Polynesia
      "GU", // Guam
      "KI", // Kiribati
      "MH", // Marshall Islands
      "FM", // Micronesia
      "NR", // Nauru
      "NC", // New Caledonia
      "NZ", // New Zealand
      "NU", // Niue
      "NF", // Norfolk Island
      "MP", // Northern Mariana Islands
      "PW", // Palau
      "PG", // Papua New Guinea
      "PN", // Pitcairn Islands
      "WS", // Samoa
      "SB", // Solomon Islands
      "TK", // Tokelau
      "TO", // Tonga
      "TV", // Tuvalu
      "UM", // United States Minor Outlying Islands
      "VU", // Vanuatu
      "WF" // Wallis and Futuna
    ];

    return oceaniaCountries.includes(countryCode.toUpperCase());
  }

  static isEUCountry(countryCode: string): boolean {
    return [
      "AT",
      "BE",
      "BG",
      "HR",
      "CY",
      "CZ",
      "DK",
      "EE",
      "FI",
      "FR",
      "DE",
      "GR",
      "HU",
      "IE",
      "IT",
      "LV",
      "LT",
      "LU",
      "MT",
      "NL",
      "PL",
      "PT",
      "RO",
      "SK",
      "SI",
      "ES",
      "SE"
    ].includes(countryCode.toUpperCase());
  }

  static isGDPRCountry(countryCode: string): boolean {
    return [
      "AT", // Austria
      "BE", // Belgium
      "BG", // Bulgaria
      "CY", // Cyprus
      "CZ", // Czech Republic
      "DE", // Germany
      "DK", // Denmark
      "EE", // Estonia
      "ES", // Spain
      "FI", // Finland
      "FR", // France
      "GB", // United Kingdom
      "GR", // Greece
      "HR", // Croatia
      "HU", // Hungary
      "IE", // Ireland
      "IT", // Italy
      "LT", // Lithuania
      "LU", // Luxembourg
      "LV", // Latvia
      "MT", // Malta
      "NL", // The Netherlands
      "PL", // Poland
      "PT", // Portugal
      "RO", // Romania
      "SE", // Sweden
      "SI", // Slovenia
      "SK" // Slovakia
    ].includes(countryCode.toUpperCase());
  }

  static csvToArrayOfDictionaries(csvString: string): Record<string, string>[] {
    const lines = csvString.split("\n");
    const headers = lines[0].split(",");
    const result: Record<string, string>[] = [];

    for (const line of lines.slice(1)) {
      // Skip empty lines
      if (!line.trim()) {
        continue;
      }

      const values = line.split(",");
      if (values.length !== headers.length) {
        continue;
      }

      const row: Record<string, string> = {};
      for (let i = 0; i < headers.length; i++) {
        // Only add non-empty values to prevent validation errors
        if (values[i] && values[i].trim() !== "") {
          row[headers[i]] = values[i].trim();
        }
      }
      result.push(row);
    }

    return result;
  }

  static humanFileSize(size: number) {
    return size / (1024 * 1024) > 1 ? (size / (1024 * 1024)).toFixed(2) + " MB" : (size / 1024).toFixed(2) + " KB";
  }

  static getEnumKeys<E>(enumObj: E): string[] {
    return Object.keys(enumObj).filter(key => isNaN(Number(key)));
  }

  static isValidEnumValue(value: any, enumType: any): boolean {
    return Object.values(enumType).includes(value);
  }

  static cloneValue(value: any): any {
    if (value === null || value === undefined) {
      return value;
    }

    if (typeof value === "object") {
      if (Array.isArray(value)) {
        return value.map(UtilsService.cloneValue);
      } else {
        const clonedObj = {};
        for (const key in value) {
          if (value.hasOwnProperty(key)) {
            clonedObj[key] = UtilsService.cloneValue(value[key]);
          }
        }
        return clonedObj;
      }
    }

    // For primitive types (string, number, boolean)
    return value;
  }

  static convertDefaultAvatar(avatar: string): string {
    if (!avatar || avatar === "" || avatar.indexOf("default-avatar") > -1) {
      return Constants.DEFAULT_AVATAR;
    }

    return avatar;
  }

  static getScrollableParent(element: HTMLElement, windowRefService: WindowRefService): HTMLElement | Window {
    if (!element) {
      return null;
    }

    let parent = element.parentElement;

    while (parent) {
      const overflowY = windowRefService.nativeWindow.getComputedStyle(parent).overflowY;
      if (overflowY === "auto" || overflowY === "scroll") {
        return parent;
      }
      parent = parent.parentElement;
    }

    return windowRefService.nativeWindow;
  }

  static clamp(value: number, min: number, max: number): number {
    return Math.min(Math.max(value, min), max);
  }

  supportsDateInput() {
    if (isPlatformServer(this.platformId)) {
      return false;
    }

    const input = document.createElement("input");
    input.setAttribute("type", "date");

    const notADateValue = "not-a-date";
    input.setAttribute("value", notADateValue);

    return input.value !== notADateValue;
  }

  insertScript(url: string, renderer: Renderer2, cb?: () => void) {
    const alreadyInserted = document.querySelectorAll(`script[src="${url}"]`).length > 0;

    if (alreadyInserted) {
      if (cb) {
        cb();
      }
      return;
    }

    const script = renderer.createElement("script");
    script.src = url;
    script.async = true;
    if (cb) {
      script.onload = () => {
        cb();
      };
    }

    renderer.appendChild(document.body, script);
  }

  insertStylesheet(url: string, renderer: Renderer2, cb?: () => void) {
    const alreadyInserted = document.querySelectorAll(`link[rel="stylesheet"][href="${url}"]`).length > 0;

    if (alreadyInserted) {
      if (cb) {
        cb();
      }
      return;
    }

    const link = renderer.createElement("link");
    link.rel = "stylesheet";
    link.href = url;
    link.type = "text/css";
    if (cb) {
      link.onload = () => {
        cb();
      };
    }

    renderer.appendChild(document.head, link);
  }

  isElementVisibleInContainer(child: HTMLElement, container: HTMLElement): boolean {
    if (!isPlatformBrowser(this.platformId)) {
      return false;
    }

    const childRect = child.getBoundingClientRect();
    const containerRect = container.getBoundingClientRect();

    return childRect.bottom > containerRect.top && childRect.top < containerRect.bottom;
  }

  isNearOrInViewport(element: HTMLElement, options: ViewportCheckOptions = {}): boolean {
    if (!isPlatformBrowser(this.platformId)) {
      return false;
    }

    const {
      shouldCheckVertical = true,
      shouldCheckHorizontal = true,
      verticalTolerance = 2000,
      horizontalTolerance = 10
    } = options;

    const rect = this._getElementRect(element);

    // If element has no dimensions, it's not visible
    if (rect.width === 0 || rect.height === 0) {
      return false;
    }

    let isWithinVerticalTolerance = true;
    let isWithinHorizontalTolerance = true;

    if (shouldCheckVertical) {
      isWithinVerticalTolerance =
        rect.top <= window.innerHeight + verticalTolerance && rect.bottom >= -verticalTolerance;
    }

    if (shouldCheckHorizontal) {
      isWithinHorizontalTolerance =
        rect.left <= window.innerWidth + horizontalTolerance && rect.right >= -horizontalTolerance;
    }

    return isWithinVerticalTolerance && isWithinHorizontalTolerance;
  }

  isNearTop(windowRefService: WindowRefService, elementRef: ElementRef): boolean {
    if (!isPlatformBrowser(this.platformId)) {
      return false;
    }

    const window = windowRefService.nativeWindow;
    const rect = elementRef.nativeElement.getBoundingClientRect();

    return rect.top < window.innerHeight + 2000;
  }

  isNearBottom(windowRefService: WindowRefService, elementRef: ElementRef): boolean {
    if (!isPlatformBrowser(this.platformId)) {
      return false;
    }

    const window = windowRefService.nativeWindow;
    const rect = this._getElementRect(elementRef.nativeElement);

    return rect.bottom < window.innerHeight + 10000;
  }

  delay(ms: number): Observable<void> {
    return new Observable<void>(observer => {
      if (isPlatformBrowser(this.platformId)) {
        interval(ms)
          .pipe(take(1))
          .subscribe(() => {
            observer.next();
            observer.complete();
          });
      } else {
        // Complete immediately.
        observer.next();
        observer.complete();
      }
    });
  }

  yesNo(value: any): string {
    if (!value || value === "0" || (UtilsService.isFunction(value.toLowerCase) && value.toLowerCase() === "false")) {
      return this.translateService.instant("No");
    }

    return this.translateService.instant("Yes");
  }

  // Gets an object by id, first looking in the store via the provided selector, then using the provided API call.
  getFromStoreOrApiById<T>(
    store$: Store<MainState>,
    id: number,
    selector: SelectorWithProps<any, number, T>,
    apiCall: (number) => Observable<T>,
    apiContext: any
  ): Observable<T> {
    const fromApi: Observable<T> = apiCall.apply(apiContext, [id]);
    return store$.select(selector, id).pipe(switchMap(fromStore => (fromStore !== null ? of(fromStore) : fromApi)));
  }

  objectKeys(obj: any): string[] {
    return Object.keys(obj);
  }

  async getResizeObserver(): Promise<typeof ResizeObserver> {
    if (typeof ResizeObserver !== "undefined") {
      return ResizeObserver;
    }

    if (window["PolyfillResizeObserver"]) {
      return window["PolyfillResizeObserver"];
    }

    const module = await import("@juggle/resize-observer");
    window["PolyfillResizeObserver"] = module.ResizeObserver;
    return module.ResizeObserver;
  }

  private _getElementRect(element: HTMLElement): DOMRect {
    const now = Date.now();
    const cached = this._rectCache.get(element);

    if (cached && now - cached.timestamp < this.RECT_CACHE_DURATION) {
      return cached.rect;
    }

    const rect = element.getBoundingClientRect();
    this._rectCache.set(element, { rect, timestamp: now });
    return rect;
  }
}

export function distinctUntilChangedObj<T>() {
  return distinctUntilChanged<T>((a, b) => JSON.stringify(a) === JSON.stringify(b));
}

export function distinctUntilKeyChangedOrNull<T>(key: string) {
  return distinctUntilChanged<T>((a, b) => {
    if (a === b) {
      return true;
    }

    return !!a && !!b && a[key] === b[key];
  });
}
