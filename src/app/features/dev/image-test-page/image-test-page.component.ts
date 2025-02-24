import { Component, OnInit } from "@angular/core";
import { SetBreadcrumb } from "@app/store/actions/breadcrumb.actions";
import { MainState } from "@app/store/state";
import { Store } from "@ngrx/store";
import { ImageAlias } from "@core/enums/image-alias.enum";

@Component({
  selector: "astrobin-image-test-page",
  templateUrl: "./image-test-page.component.html"
})
export class ImageTestPageComponent implements OnInit {
  readonly id = 1;
  readonly alias = ImageAlias.REGULAR;

  constructor(public readonly store$: Store<MainState>) {
  }

  ngOnInit() {
    this.store$.dispatch(new SetBreadcrumb({ breadcrumb: [] }));
  }
}
