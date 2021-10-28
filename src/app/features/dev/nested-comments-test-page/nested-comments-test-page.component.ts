import { Component, OnInit } from "@angular/core";
import { BaseComponentDirective } from "@shared/components/base-component.directive";
import { State } from "@app/store/state";
import { Store } from "@ngrx/store";
import { ContentTypeGenerator } from "@shared/generators/content-type.generator";

@Component({
  selector: "astrobin-nested-comments-test-page",
  templateUrl: "./nested-comments-test-page.component.html"
})
export class NestedCommentsTestPageComponent extends BaseComponentDirective implements OnInit {
  contentType = ContentTypeGenerator.contentType({ id: 108, appLabel: "astrobin", model: "image" });
  objectId = 1;

  constructor(public readonly store$: Store<State>) {
    super(store$);
  }

  ngOnInit(): void {}
}
