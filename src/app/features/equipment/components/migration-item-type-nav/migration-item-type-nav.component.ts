import { Component, Input, OnInit } from "@angular/core";
import { BaseComponentDirective } from "@shared/components/base-component.directive";
import { Store } from "@ngrx/store";
import { State } from "@app/store/state";
import { Actions } from "@ngrx/effects";
import { ActivatedRoute, NavigationEnd, Router } from "@angular/router";
import { Observable } from "rxjs";
import { takeUntil } from "rxjs/operators";

@Component({
  selector: "astrobin-migration-item-type-nav",
  templateUrl: "./migration-item-type-nav.component.html",
  styleUrls: ["./migration-item-type-nav.component.scss"]
})
export class MigrationItemTypeNavComponent extends BaseComponentDirective implements OnInit {
  @Input()
  cameraCount: Observable<number>;

  activeType = this.activatedRoute.snapshot.paramMap.get("itemType");

  constructor(
    public readonly store$: Store<State>,
    public readonly actions$: Actions,
    public readonly activatedRoute: ActivatedRoute,
    public readonly router: Router
  ) {
    super(store$);
  }

  ngOnInit(): void {
    this.router.events.pipe(takeUntil(this.destroyed$)).subscribe(event => {
      if (event instanceof NavigationEnd) {
        this.activeType = this.activatedRoute.snapshot.paramMap.get("itemType");
      }
    });
  }
}
