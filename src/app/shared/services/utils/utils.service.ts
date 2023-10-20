import { Inject, Injectable, PLATFORM_ID, Renderer2 } from "@angular/core";
import { distinctUntilChanged, switchMap, take } from "rxjs/operators";
import { TranslateService } from "@ngx-translate/core";
import { Store } from "@ngrx/store";
import { State } from "@app/store/state";
import { SelectorWithProps } from "@ngrx/store/src/models";
import { interval, Observable, of } from "rxjs";
import { isPlatformBrowser, isPlatformServer } from "@angular/common";
import { FormlyFieldConfig } from "@ngx-formly/core";
import { CookieService } from "ngx-cookie";
import { PopNotificationsService } from "@shared/services/pop-notifications.service";

@Injectable({
  providedIn: "root"
})
export class UtilsService {
  constructor(
    public readonly store$: Store<State>,
    public readonly translateService: TranslateService,
    public readonly cookieService: CookieService,
    @Inject(PLATFORM_ID) public readonly platformId
  ) {
  }

  static removeQuotes(str: string): string {
    if (str.length >= 2 && str.startsWith("\"") && str.endsWith("\"")) {
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
    let a = array.concat();

    if (reverse) {
      // The array is reverser because this algorithm prefers to keep the object appearing later in the array.
      a = a.reverse();
    }

    for (let i = 0; i < a.length; ++i) {
      for (let j = i + 1; j < a.length; ++j) {
        if ((!key && JSON.stringify(a[i]) === JSON.stringify(a[j])) || (!!key && a[i][key] === a[j][key])) {
          a.splice(j--, 1);
        }
      }
    }

    return a;
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
    let regex = new RegExp(`[&\?]${name}=`);

    if (regex.test(url)) {
      regex = new RegExp(`([&\?])${name}=.+?(?=&|$)`);
      return url.replace(regex, "$1" + name + "=" + value);
    }

    if (url.indexOf("?") > -1) {
      return url + "&" + name + "=" + value;
    }

    return url + "?" + name + "=" + value;
  }

  static removeUrlParam(url: string, parameter: string): string {
    const urlParts = url.split("?");

    if (urlParts.length >= 2) {
      const prefix = encodeURIComponent(parameter) + "=";
      const pars = urlParts[1].split(/[&;]/g);

      for (let i = pars.length; i-- > 0;) {
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
    return obj != null && obj.constructor.name === "Object";
  }

  static isArray(obj): boolean {
    return obj != null && obj.constructor.name === "Array";
  }

  static isNotEmptyDictionary<T>(variable: T | null | undefined): boolean {
    if (variable === null || variable === undefined) {
      return false;
    }

    return !(typeof variable === "object" && Object.keys(variable).length === 0);
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
    let path: string[] = [];

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
    translateService: TranslateService) {
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
    let count: number = 0;

    for (let prop in obj) {
      if (excludeProps.includes(prop)) {
        continue;
      }

      if (obj[prop] !== null && obj[prop] !== undefined && obj[prop] !== false) {
        count++;
      }
    }

    return count;
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
      const values = line.split(",");
      if (values.length !== headers.length) {
        continue;
      }

      const row: Record<string, string> = {};
      for (let i = 0; i < headers.length; i++) {
        row[headers[i]] = values[i];
      }
      result.push(row);
    }

    return result;
  }

  static humanFileSize(size: number) {
    return size / (1024 * 1024) > 1 ? (size / (1024 * 1024)).toFixed(2) + " MB" : (size / 1024).toFixed(2) + " KB";
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

  isNearBelowViewport(element: HTMLElement): boolean {
    if (!isPlatformBrowser(this.platformId)) {
      return false;
    }

    const maxDistance = 500;
    const rect = element.getBoundingClientRect();
    return (
      rect.top >= 0 &&
      rect.left >= 0 &&
      rect.bottom <= (window.innerHeight || window.document.documentElement.clientHeight) + maxDistance &&
      rect.right <= (window.innerWidth || window.document.documentElement.clientWidth)
    );
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
    store$: Store<State>,
    id: number,
    selector: SelectorWithProps<any, number, T>,
    apiCall: (number) => Observable<T>,
    apiContext: any
  ): Observable<T> {
    const fromApi: Observable<T> = apiCall.apply(apiContext, [id]);
    return store$.select(selector, id).pipe(switchMap(fromStore => (fromStore !== null ? of(fromStore) : fromApi)));
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
