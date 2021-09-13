import { Component, OnInit } from "@angular/core";
import { BaseComponentDirective } from "@shared/components/base-component.directive";
import { Store } from "@ngrx/store";
import { State } from "@app/store/state";
import { Actions } from "@ngrx/effects";
import { ActivatedRoute } from "@angular/router";

@Component({
  selector: "astrobin-migration-nav",
  templateUrl: "./migration-nav.component.html",
  styleUrls: ["./migration-nav.component.scss"]
})
export class MigrationNavComponent extends BaseComponentDirective implements OnInit {
  activeId = "migration";

  constructor(
    public readonly store$: Store<State>,
    public readonly actions$: Actions,
    public readonly activatedRoute: ActivatedRoute
  ) {
    super(store$);
  }

  ngOnInit(): void {
    const url = this.activatedRoute.snapshot.url[0].path;

    if (url === "migration-tool") {
      this.activeId = "migration";
    } else if (url === "migration-review") {
      this.activeId = "review";
    } else if (url === "migration-explorer") {
      this.activeId = "explorer";
    }
  }
}
