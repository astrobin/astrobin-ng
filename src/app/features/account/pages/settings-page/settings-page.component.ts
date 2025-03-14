import { ChangeDetectionStrategy, Component, Inject, OnInit, PLATFORM_ID } from "@angular/core";
import { BaseComponentDirective } from "@shared/components/base-component.directive";
import { Store } from "@ngrx/store";
import { MainState } from "@app/store/state";
import { take } from "rxjs/operators";
import { ActivatedRoute } from "@angular/router";
import { PopNotificationsService } from "@core/services/pop-notifications.service";
import { TranslateService } from "@ngx-translate/core";
import { LoadUser } from "@features/account/store/auth.actions";
import { isPlatformBrowser } from "@angular/common";
import { TitleService } from "@core/services/title/title.service";
import { SetBreadcrumb } from "@app/store/actions/breadcrumb.actions";

@Component({
  selector: "astrobin-account-settings-page",
  templateUrl: "./settings-page.component.html",
  styleUrls: ["./settings-page.component.scss"],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SettingsPageComponent extends BaseComponentDirective implements OnInit {
  activeTab = "profile";
  protected readonly isBrowser: boolean;

  constructor(
    public readonly store$: Store<MainState>,
    private readonly route: ActivatedRoute,
    private readonly popNotificationsService: PopNotificationsService,
    private readonly translateService: TranslateService,
    private readonly titleService: TitleService,
    @Inject(PLATFORM_ID) private readonly platformId: Object
  ) {
    super(store$);
    this.isBrowser = isPlatformBrowser(this.platformId);
  }

  ngOnInit() {
    super.ngOnInit();

    // Set page title
    const title = this.translateService.instant("Account settings");
    this.titleService.setTitle(title);

    // Set breadcrumb
    this.store$.dispatch(
      new SetBreadcrumb({
        breadcrumb: [
          {
            label: this.translateService.instant("Account"),
            link: "/account"
          },
          {
            label: this.translateService.instant("Settings")
          }
        ]
      })
    );

    // Check if a specific tab was requested via the URL fragment (e.g., #avatar)
    this.route.fragment.pipe(
      take(1)
    ).subscribe(fragment => {
      if (fragment) {
        this.activeTab = fragment;
      }
    });
  }

  onAvatarUpdated(newAvatarUrl: string): void {
    if (!this.isBrowser) {
      return;
    }

    // Reload the user data to get the updated avatar
    this.currentUser$.pipe(take(1)).subscribe(user => {
      if (user) {
        this.store$.dispatch(new LoadUser({ id: user.id }));
      }
    });
  }
}
