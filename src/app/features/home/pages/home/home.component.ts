import { ChangeDetectionStrategy, Component, OnInit } from "@angular/core";
import { BaseComponentDirective } from "@shared/components/base-component.directive";
import { MainState } from "@app/store/state";
import { Store } from "@ngrx/store";
import { SetBreadcrumb } from "@app/store/actions/breadcrumb.actions";
import { TitleService } from "@shared/services/title/title.service";
import { TranslateService } from "@ngx-translate/core";

@Component({
  selector: 'astrobin-home',
  template: `
    <div class="page">
      <astrobin-iotd></astrobin-iotd>
      <astrobin-feed></astrobin-feed>
    </div>
  `,
  styleUrls: ['./home.component.scss']
})
export class HomeComponent extends BaseComponentDirective implements OnInit {
  constructor(
    public readonly store$: Store<MainState>,
    public readonly titleService: TitleService,
    public readonly translateService: TranslateService
  ) {
    super(store$);
  }

  ngOnInit() {
    super.ngOnInit();

    this.store$.dispatch(new SetBreadcrumb({ breadcrumb: [] }));
    this.titleService.setTitle(this.translateService.instant('Home of Astrophotography'));
  }
}
