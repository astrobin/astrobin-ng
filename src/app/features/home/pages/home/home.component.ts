import { ChangeDetectionStrategy, Component, OnInit } from "@angular/core";
import { BaseComponentDirective } from "@shared/components/base-component.directive";
import { MainState } from "@app/store/state";
import { Store } from "@ngrx/store";
import { SetBreadcrumb } from "@app/store/actions/breadcrumb.actions";
import { TitleService } from "@shared/services/title/title.service";
import { TranslateService } from "@ngx-translate/core";
import { ClassicRoutesService } from "@shared/services/classic-routes.service";

@Component({
  selector: 'astrobin-home',
  template: `
    <div class="page">
      <astrobin-iotd></astrobin-iotd>

      <div class="latest-from-the-forums">
        <div class="
          header
          d-flex
          justify-content-center justify-content-md-between
          align-items-center
          flex-column flex-md-row
          mb-3
          px-4
        ">
          <h4>{{ "Latest from the forums" | translate }}</h4>
          <div class="d-flex gap-2">
            <a [href]="classicRoutesService.FORUM_LATEST">
              {{ "View all" | translate }}
            </a>

            <span class="text-muted">&middot;</span>

            <a [href]="classicRoutesService.FORUM_HOME + '#new-topic'">
              {{ "New topic" | translate }}
            </a>
          </div>
        </div>

        <astrobin-forum-preview
          [showHeader]="false"
          [showFooter]="false"
          [useCard]="false"
        ></astrobin-forum-preview>
      </div>

      <astrobin-feed></astrobin-feed>
    </div>
  `,
  styleUrls: ['./home.component.scss']
})
export class HomeComponent extends BaseComponentDirective implements OnInit {
  constructor(
    public readonly store$: Store<MainState>,
    public readonly titleService: TitleService,
    public readonly translateService: TranslateService,
    public readonly classicRoutesService: ClassicRoutesService
  ) {
    super(store$);
  }

  ngOnInit() {
    super.ngOnInit();

    this.store$.dispatch(new SetBreadcrumb({ breadcrumb: [] }));
    this.titleService.setTitle(this.translateService.instant('Home of Astrophotography'));
  }
}
