import { Component } from "@angular/core";
import type { MainState } from "@app/store/state";
import { Store } from "@ngrx/store";
import { BaseComponentDirective } from "@shared/components/base-component.directive";
import { ContentTypeGenerator } from "@shared/generators/content-type.generator";

@Component({
  selector: "astrobin-nested-comments-test-page",
  templateUrl: "./nested-comments-test-page.component.html"
})
export class NestedCommentsTestPageComponent extends BaseComponentDirective {
  contentType = ContentTypeGenerator.contentType({ id: 108, appLabel: "astrobin", model: "image" });
  objectId = 1;

  constructor(public readonly store$: Store<MainState>) {
    super(store$);
  }
}
