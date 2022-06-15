import { Injectable } from "@angular/core";
import { BaseService } from "@shared/services/base.service";

// @ts-ignore
// tslint:disable-next-line:no-empty-interface
export interface CustomWindowInterface extends Window {}

function getWindow(): any {
  // @ts-ignore
  return window;
}

@Injectable()
export class WindowRefService extends BaseService {
  get nativeWindow(): CustomWindowInterface {
    return getWindow();
  }

  scroll(options: any) {
    this.nativeWindow.scroll(options);
  }

  scrollToElement(selector: string, options?: boolean | ScrollIntoViewOptions) {
    let attempts = 0;

    const _doScroll = () => {
      const timeout = 100;

      if (attempts >= 5) {
        return;
      }

      const $element = this.nativeWindow.document.querySelector(selector);
      if (!!$element) {
        setTimeout(() => $element.scrollIntoView(options), timeout);
      } else {
        attempts++;
        setTimeout(() => _doScroll(), timeout);
      }
    };

    if (options === null || options === undefined) {
      options = { behavior: "smooth", block: "start", inline: "nearest" };
    }

    _doScroll();
  }

  getCurrentUrl(): URL {
    return new URL(this.nativeWindow.document.URL);
  }

  locationAssign(url: string) {
    this.nativeWindow.location.assign(url);
  }
}
