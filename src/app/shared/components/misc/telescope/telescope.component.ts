import type { AfterViewInit, OnInit } from "@angular/core";
import { Component, Input } from "@angular/core";
import { LoadTelescope } from "@app/store/actions/telescope.actions";
import { selectTelescope } from "@app/store/selectors/app/telescope.selectors";
import type { MainState } from "@app/store/state";
import type { TelescopeInterface } from "@core/interfaces/telescope.interface";
import type { GearService } from "@core/services/gear/gear.service";
import type { UtilsService } from "@core/services/utils/utils.service";
import type { Store } from "@ngrx/store";
import { BaseComponentDirective } from "@shared/components/base-component.directive";
import type { Observable } from "rxjs";

@Component({
  selector: "astrobin-telescope",
  templateUrl: "./telescope.component.html",
  styleUrls: ["./telescope.component.scss"]
})
export class TelescopeComponent extends BaseComponentDirective implements OnInit, AfterViewInit {
  telescope$: Observable<TelescopeInterface>;

  @Input()
  id: number;

  @Input()
  loadDelay = 0;

  constructor(
    public readonly store$: Store<MainState>,
    public readonly gearService: GearService,
    public readonly utilsService: UtilsService
  ) {
    super(store$);
  }

  ngOnInit(): void {
    super.ngOnInit();

    if (this.id === undefined) {
      throw new Error("Attribute 'id' is required");
    }

    this.telescope$ = this.store$.select(selectTelescope, this.id);
  }

  ngAfterViewInit() {
    this.utilsService.delay(this.loadDelay).subscribe(() => {
      this.store$.dispatch(new LoadTelescope(this.id));
    });
  }
}
