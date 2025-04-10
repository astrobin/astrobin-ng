import type { OnInit } from "@angular/core";
import { Component } from "@angular/core";
import { SetBreadcrumb } from "@app/store/actions/breadcrumb.actions";
import type { MainState } from "@app/store/state";
import { ClassicRoutesService } from "@core/services/classic-routes.service";
import { TitleService } from "@core/services/title/title.service";
import { Store } from "@ngrx/store";
import { TranslateService } from "@ngx-translate/core";
import { BaseComponentDirective } from "@shared/components/base-component.directive";

@Component({
  selector: "astrobin-permission-denied-page",
  templateUrl: "./permission-denied-page.component.html"
})
export class PermissionDeniedPageComponent extends BaseComponentDirective implements OnInit {
  constructor(
    public readonly store$: Store<MainState>,
    public readonly classicRoutes: ClassicRoutesService,
    public readonly translateService: TranslateService,
    public readonly titleService: TitleService
  ) {
    super(store$);
  }

  ngOnInit(): void {
    super.ngOnInit();

    const title = this.translateService.instant("Permission denied");
    this.titleService.setTitle(title);
    this.store$.dispatch(
      new SetBreadcrumb({
        breadcrumb: [{ label: title }]
      })
    );
  }
}
