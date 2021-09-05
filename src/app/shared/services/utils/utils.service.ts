import { Injectable } from "@angular/core";
import { distinctUntilChanged, mergeMap } from "rxjs/operators";
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
   * Removes duplicates from an array. Items must be able to be stringified using JSON.
   * @param array
   */
  static arrayUniqueObjects(array: any): any {
    const a = array.concat();
    for (let i = 0; i < a.length; ++i) {
      for (let j = i + 1; j < a.length; ++j) {
        if (JSON.stringify(a[i]) === JSON.stringify(a[j])) {
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

  static isFunction(functionToCheck) {
    return functionToCheck && {}.toString.call(functionToCheck) === "[object Function]";
  }

  yesNo(value) {
    return value ? this.translateService.instant("Yes") : this.translateService.instant("No");
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
    return store$.select(selector, id).pipe(mergeMap(fromStore => (fromStore !== null ? of(fromStore) : fromApi)));
  }
}

export function distinctUntilChangedObj<T>() {
  return distinctUntilChanged<T>((a, b) => JSON.stringify(a) === JSON.stringify(b));
}
