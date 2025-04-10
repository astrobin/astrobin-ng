import { ChangeDetectionStrategy, Component } from "@angular/core";
import type { MainState } from "@app/store/state";
import { ClassicRoutesService } from "@core/services/classic-routes.service";
import { environment } from "@env/environment";
import { Store } from "@ngrx/store";
import { BaseComponentDirective } from "@shared/components/base-component.directive";

@Component({
  selector: "astrobin-footer",
  templateUrl: "./footer.component.html",
  styleUrls: ["./footer.component.scss"],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class FooterComponent extends BaseComponentDirective {
  protected readonly currentYear: number;
  protected readonly version: string;

  constructor(public readonly store$: Store<MainState>, public readonly classicRoutesService: ClassicRoutesService) {
    super(store$);
    this.currentYear = new Date().getFullYear();
    this.version = environment.buildVersion;
  }
}
