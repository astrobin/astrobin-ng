import { Inject, Injectable } from "@angular/core";
import { BaseService } from "@shared/services/base.service";
import { LoadingService } from "@shared/services/loading.service";
import { DOCUMENT, Location } from "@angular/common";
import { UtilsService } from "@shared/services/utils/utils.service";
import { Router } from "@angular/router";
import { BehaviorSubject, fromEvent } from "rxjs";
import { debounceTime } from "rxjs/operators";
import { IonContent } from "@ionic/angular";
import { PlatformService } from "@shared/services/platform.service";

// @ts-ignore
// eslint-disable-next-line @typescript-eslint/no-empty-interface
export interface CustomWindowInterface extends Window {
}

@Injectable()
export class WindowRefService extends BaseService {
  private _isMobile = new BehaviorSubject<boolean>(false);

  constructor(
    public readonly loadingService: LoadingService,
    @Inject(DOCUMENT) private _doc: Document,
    public readonly utilsService: UtilsService,
    public readonly router: Router,
    private readonly location: Location,
    private readonly platformService: PlatformService
  ) {
    super(loadingService);

    if (!this.platformService.isServer) {
      fromEvent(this.nativeWindow, "resize")
        .pipe(
          debounceTime(300)
        )
        .subscribe(() => {
          this.checkDevice(window.innerWidth);
        });

      this.checkDevice(this.nativeWindow.innerWidth);
    }
  }

  get nativeWindow(): CustomWindowInterface {
    return this._doc.defaultView;
  }

  getViewPortAspectRatio(): number {
    if (this.platformService.isServer) {
      return 1;
    }

    return window.innerWidth / window.innerHeight;
  }

  async scroll(options: any) {
    if (!this.platformService.canAccessDOM()) {
      return;
    }

    if (!options) {
      options = { top: 0, left: 0, behavior: "auto" };
    }

    if (this.platformService.isNative) {
      const content = this.nativeWindow.document.querySelector("ion-content");
      if (content instanceof HTMLIonContentElement) {
        await (content as any as IonContent).scrollToPoint(options.left, options.top, options.behavior === "smooth" ? 300 : 0);
      }
      return;
    }

    let overrideScrollBehavior = options.behavior === "auto" || options.behavior === undefined;

    if (overrideScrollBehavior) {
      this.nativeWindow.document.documentElement.style.scrollBehavior = "auto";
    }

    this.nativeWindow.scroll(options);

    if (overrideScrollBehavior) {
      this.utilsService.delay(100).subscribe(() => {
        this.nativeWindow.document.documentElement.style.scrollBehavior = "";
      });
    }
  }

  scrollToElement(selector: string, options?: boolean | ScrollIntoViewOptions) {
    if (this.platformService.isServer) {
      return;
    }

    let attempts = 0;

    const _doScroll = () => {
      const timeout = 100;

      if (attempts >= 5) {
        return;
      }

      const $element = this.nativeWindow.document.querySelector(selector);
      if (!!$element) {
        this.utilsService.delay(timeout).subscribe(() => {
          $element.scrollIntoView(options);
        });
      } else {
        attempts++;
        this.utilsService.delay(timeout).subscribe(() => {
          _doScroll();
        });
      }
    };

    if (options === null || options === undefined) {
      options = { behavior: "smooth", block: "start", inline: "nearest" };
    }

    _doScroll();
  }

  focusElement(selector: string) {
    if (this.platformService.isServer) {
      return;
    }

    let attempts = 0;

    const _doFocus = () => {
      const timeout = 100;

      if (attempts >= 5) {
        return;
      }

      const $element = this.nativeWindow.document.querySelector(selector) as HTMLElement;
      if (!!$element) {
        this.utilsService.delay(timeout).subscribe(() => {
          $element.focus();
        });
      } else {
        attempts++;
        this.utilsService.delay(timeout).subscribe(() => {
          _doFocus();
        });
      }
    };

    _doFocus();
  }

  getCurrentUrl(): URL {
    return new URL(this.nativeWindow.document.URL);
  }

  locationAssign(url: string) {
    this.loadingService.setLoading(true);
    this.nativeWindow.location.assign(url);
  }

  routeTo404(fromUrl?: string) {
    if (!fromUrl) {
      fromUrl = this.getCurrentUrl().pathname;
    }

    this.router.navigateByUrl("/404", { skipLocationChange: true }).then(() => {
      this.location.replaceState(fromUrl);
    });
  }

  checkDevice(width: number) {
    this._isMobile.next(width < 768);
  }

  pushState(data: any, url: string) {
    this._pushOrReplaceState("pushState", data, url);
  }

  replaceState(data: any, url: string) {
    this._pushOrReplaceState("replaceState", data, url);
  }

  changeBodyOverflow(value: "hidden" | "auto"): void {
    if (!this.platformService.isServer) {
      const _document = this.nativeWindow.document;
      if (_document) {
        _document.body.classList.toggle("overflow-hidden", value === "hidden");
      }
    }
  }

  private _pushOrReplaceState(method: "pushState" | "replaceState", data: any, url: string) {
    if (this.platformService.isServer) {
      return;
    }

    const _history = this.nativeWindow.history;
    const currentState = JSON.parse(JSON.stringify(_history.state));

    if (
      currentState &&
      currentState.url === url &&
      JSON.stringify(currentState.data) === JSON.stringify(data)
    ) {
      return;
    }

    _history[method](data, "", url);
  }
}
