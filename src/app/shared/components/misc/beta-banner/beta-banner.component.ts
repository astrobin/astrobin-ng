import { Component, HostBinding, Inject, PLATFORM_ID } from "@angular/core";
import { BaseComponentDirective } from "@shared/components/base-component.directive";
import { State } from "@app/store/state";
import { Store } from "@ngrx/store";
import { WindowRefService } from "@shared/services/window-ref.service";
import { isPlatformServer } from "@angular/common";
import { TranslateService } from "@ngx-translate/core";

@Component({
  selector: "astrobin-beta-banner",
  templateUrl: "./beta-banner.component.html",
  styleUrls: ["./beta-banner.component.scss"]
})
export class BetaBannerComponent extends BaseComponentDirective {
  readonly message: string = this.translateService.instant(
    "As a member of the {{0}}AstroBin Beta Testers{{1}} group, you are currently on the beta version of this " +
    "app. To learn why a beta version is currently being tested, please see the latest posts on the {{2}}AstroBin " +
    "Beta Testers forum{{3}}.", {
      0: "<strong>",
      1: "</strong>",
      2: "<a href=\"https://www.astrobin.com/forum/c/group-forums/astrobin-beta-testers/\" target=\"_blank\">",
      3: "</a>"
    }
  );

  constructor(
    public readonly store$: Store<State>,
    public readonly windowRefService: WindowRefService,
    @Inject(PLATFORM_ID) public readonly platformId: Object,
    public readonly translateService: TranslateService
  ) {
    super(store$);
  }

  @HostBinding("class.hidden") get hidden(): boolean {
    if (isPlatformServer(this.platformId)) {
      return true;
    }

    return this.windowRefService.nativeWindow.location.hostname.indexOf("beta") === -1;
  }
}
