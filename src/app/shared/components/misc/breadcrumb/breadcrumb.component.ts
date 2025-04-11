import { OnInit, Component } from "@angular/core";
import { selectBreadcrumb } from "@app/store/selectors/app/app.selectors";
import { MainState } from "@app/store/state";
import { ClassicRoutesService } from "@core/services/classic-routes.service";
import { Store } from "@ngrx/store";
import { BaseComponentDirective } from "@shared/components/base-component.directive";
import { BreadcrumbInterface } from "@shared/components/misc/breadcrumb/breadcrumb.interface";
import { Observable } from "rxjs";
import { takeUntil } from "rxjs/operators";

@Component({
  selector: "astrobin-breadcrumb",
  templateUrl: "./breadcrumb.component.html",
  styleUrls: ["./breadcrumb.component.scss"]
})
export class BreadcrumbComponent extends BaseComponentDirective implements OnInit {
  breadcrumb$: Observable<BreadcrumbInterface[]>;

  constructor(
    public readonly store$: Store<MainState>,
    public readonly classicRoutesService: ClassicRoutesService
  ) {
    super(store$);
  }

  ngOnInit(): void {
    super.ngOnInit();

    this.breadcrumb$ = this.store$.select(selectBreadcrumb).pipe(takeUntil(this.destroyed$));
  }
}
