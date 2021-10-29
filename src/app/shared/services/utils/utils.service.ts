import { Injectable } from "@angular/core";
import { distinctUntilChanged, mergeMap, switchMap } from "rxjs/operators";
import { TranslateService } from "@ngx-translate/core";
import { Store } from "@ngrx/store";
import { State } from "@app/store/state";
import { SelectorWithProps } from "@ngrx/store/src/models";
import { Observable, of } from "rxjs";

@Injectable({
  providedIn: "root"
})
export class UtilsService {
  constructor(public readonly store$: Store<State>, public readonly translateService: TranslateService) {}

  static uuid(): string {
    const S4 = (): string => {
      // tslint:disable-next-line:no-bitwise
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

  static isInViewport(element: HTMLElement): boolean {
    const rect = element.getBoundingClientRect();
    return (
      rect.top >= 0 &&
      rect.left >= 0 &&
      rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) &&
      rect.right <= (window.innerWidth || document.documentElement.clientWidth)
    );
  }

  static getLinksInText(text: string): string[] {
    const regex = /href="(.*?)"/gm;
    let m;
    const links = [];

    // tslint:disable-next-line:no-conditional-assignment
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

  static addOrUpdateUrlParam(url: string, name: string, value: string) {
    let regex = new RegExp("[&\\?]" + name + "=");

    if (regex.test(url)) {
      regex = new RegExp("([&\\?])" + name + "=\\S+");
      return url.replace(regex, "$1" + name + "=" + value);
    }

    if (url.indexOf("?") > -1) {
      return url + "&" + name + "=" + value;
    }

    return url + "?" + name + "=" + value;
  }

  static removeUrlParam(url: string, parameter: string) {
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
      return $1
        .toUpperCase()
        .replace("-", "")
        .replace("_", "");
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

  static slugify(s: string): string {
    if (!s) {
      return "";
    }

    return s
      .toString()
      .toLowerCase()
      .replace(/\s+/g, "-") // Replace spaces with -
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
