import { OnInit, Component } from "@angular/core";
import { SetBreadcrumb } from "@app/store/actions/breadcrumb.actions";
import { MainState } from "@app/store/state";
import { TitleService } from "@core/services/title/title.service";
import { Store } from "@ngrx/store";
import { TranslateService } from "@ngx-translate/core";
import { BaseComponentDirective } from "@shared/components/base-component.directive";

@Component({
  selector: "astrobin-logging-out-page",
  templateUrl: "./logging-out-page.component.html"
})
export class LoggingOutPageComponent extends BaseComponentDirective implements OnInit {
  title: string;

  constructor(
    public readonly store$: Store<MainState>,
    public readonly titleService: TitleService,
    public readonly translate: TranslateService
  ) {
    super(store$);
  }

  ngOnInit() {
    super.ngOnInit();

    this.title = this.translate.instant("Logging you out securely...");
    this.titleService.setTitle(this.title);
    this.store$.dispatch(new SetBreadcrumb({ breadcrumb: [{ label: "Account" }, { label: this.title }] }));
  }
}
