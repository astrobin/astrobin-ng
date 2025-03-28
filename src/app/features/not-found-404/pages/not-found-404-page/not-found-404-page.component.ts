import { Component, OnInit } from "@angular/core";
import { SetBreadcrumb } from "@app/store/actions/breadcrumb.actions";
import { MainState } from "@app/store/state";
import { Store } from "@ngrx/store";
import { TranslateService } from "@ngx-translate/core";
import { BaseComponentDirective } from "@shared/components/base-component.directive";
import { TitleService } from "@core/services/title/title.service";

@Component({
  selector: "astrobin-not-found-page",
  templateUrl: "./not-found-404-page.component.html"
})
export class NotFound404PageComponent extends BaseComponentDirective implements OnInit {
  constructor(
    public readonly store$: Store<MainState>,
    public readonly titleService: TitleService,
    public readonly translateService: TranslateService
  ) {
    super(store$);
  }

  ngOnInit() {
    super.ngOnInit();

    const title = "404";
    this.titleService.setTitle(title);

    this.store$.dispatch(
      new SetBreadcrumb({
        breadcrumb: [{ label: title }]
      })
    );
  }
}
