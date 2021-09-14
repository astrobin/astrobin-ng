import { Component, OnInit } from "@angular/core";
import { Store } from "@ngrx/store";
import { State } from "@app/store/state";
import { Actions } from "@ngrx/effects";
import { ActivatedRoute } from "@angular/router";
import { BaseComponentDirective } from "@shared/components/base-component.directive";

@Component({
  selector: "astrobin-migration-explorer",
  templateUrl: "./migration-explorer.component.html",
  styleUrls: ["./migration-explorer.component.scss"]
})
export class MigrationExplorerComponent extends BaseComponentDirective implements OnInit {
  title = "Migration explorer";
  activeType = this.activatedRoute.snapshot.paramMap.get("itemType");

  constructor(
    public readonly store$: Store<State>,
    public readonly actions$: Actions,
    public readonly activatedRoute: ActivatedRoute
  ) {
    super(store$);
  }

  ngOnInit(): void {}
}
