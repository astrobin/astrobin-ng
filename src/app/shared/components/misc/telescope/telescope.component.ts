import { Component, Input, OnInit } from "@angular/core";
import { LoadTelescope } from "@app/store/actions/app.actions";
import { AppState } from "@app/store/app.states";
import { Store } from "@ngrx/store";
import { BaseComponentDirective } from "@shared/components/base-component.directive";
import { TelescopeInterface } from "@shared/interfaces/telescope.interface";
import { GearService } from "@shared/services/gear/gear.service";
import { Observable } from "rxjs";

@Component({
  selector: "astrobin-telescope",
  templateUrl: "./telescope.component.html",
  styleUrls: ["./telescope.component.scss"]
})
export class TelescopeComponent extends BaseComponentDirective implements OnInit {
  telescope$: Observable<TelescopeInterface>;

  @Input()
  id: number;

  constructor(public readonly store$: Store<AppState>, public readonly gearService: GearService) {
    super();
  }

  ngOnInit(): void {
    if (this.id === undefined) {
      throw new Error("Attribute 'id' is required");
    }

    this.telescope$ = this.store$.select(state => {
      const telescopes = state.app.telescopes.filter(telescope => telescope.pk === this.id);
      return telescopes.length > 0 ? telescopes[0] : null;
    });

    this.store$.dispatch(new LoadTelescope(this.id));
  }
}
