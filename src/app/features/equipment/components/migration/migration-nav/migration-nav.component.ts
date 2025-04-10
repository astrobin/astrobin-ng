import { Location } from "@angular/common";
import type { OnInit } from "@angular/core";
import { Component } from "@angular/core";
import type { MainState } from "@app/store/state";
import { Store } from "@ngrx/store";
import { BaseComponentDirective } from "@shared/components/base-component.directive";
import { Constants } from "@shared/constants";

@Component({
  selector: "astrobin-migration-nav",
  templateUrl: "./migration-nav.component.html",
  styleUrls: ["./migration-nav.component.scss"]
})
export class MigrationNavComponent extends BaseComponentDirective implements OnInit {
  readonly Constants = Constants;

  activeId = "migration";

  constructor(public readonly store$: Store<MainState>, public readonly location: Location) {
    super(store$);
  }

  ngOnInit(): void {
    super.ngOnInit();

    const url = this.location.path();

    if (url.indexOf("migration-tool") > -1) {
      this.activeId = "migration";
    } else if (url.indexOf("migration-review") > -1) {
      this.activeId = "review";
    } else if (url.indexOf("migration-explorer") > -1) {
      this.activeId = "explorer";
    }
  }
}
