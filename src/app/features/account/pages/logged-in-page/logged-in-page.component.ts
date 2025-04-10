import { isPlatformBrowser } from "@angular/common";
import { OnInit, Component, Inject, PLATFORM_ID } from "@angular/core";
import { ActivatedRoute, Router } from "@angular/router";
import { SetBreadcrumb } from "@app/store/actions/breadcrumb.actions";
import { MainState } from "@app/store/state";
import { ClassicRoutesService } from "@core/services/classic-routes.service";
import { TitleService } from "@core/services/title/title.service";
import { WindowRefService } from "@core/services/window-ref.service";
import { Store } from "@ngrx/store";
import { TranslateService } from "@ngx-translate/core";
import { BaseComponentDirective } from "@shared/components/base-component.directive";
import { interval } from "rxjs";
import { take, tap } from "rxjs/operators";

@Component({
  selector: "astrobin-logged-in-page",
  templateUrl: "./logged-in-page.component.html"
})
export class LoggedInPageComponent extends BaseComponentDirective implements OnInit {
  seconds = 3;
  redirectUrl: string;

  constructor(
    public readonly store$: Store<MainState>,
    public readonly route: ActivatedRoute,
    public readonly router: Router,
    public readonly windowRef: WindowRefService,
    public readonly classicRoutesService: ClassicRoutesService,
    public readonly titleService: TitleService,
    public readonly translate: TranslateService,
    @Inject(PLATFORM_ID) public readonly platformId
  ) {
    super(store$);
  }

  redirectionMessage(seconds: number): string {
    return this.translate.instant("You will be redirected in {{seconds}} seconds...", { seconds });
  }

  ngOnInit(): void {
    super.ngOnInit();

    const title = this.translate.instant("Welcome!");
    this.titleService.setTitle(title);
    this.store$.dispatch(new SetBreadcrumb({ breadcrumb: [{ label: "Account" }, { label: title }] }));

    this.redirectUrl = this.route.snapshot.queryParamMap.get("redirectUrl");

    const _doRedirect = () => {
      if (this.redirectUrl) {
        this.router.navigateByUrl(this.redirectUrl);
      } else {
        this.router.navigateByUrl("/");
      }
    };

    if (isPlatformBrowser(this.platformId)) {
      interval(1000)
        .pipe(
          take(this.seconds),
          tap(() => this.seconds--)
        )
        .subscribe(() => {
          if (this.seconds === 0) {
            _doRedirect();
          }
        });
    } else {
      _doRedirect();
    }
  }
}
