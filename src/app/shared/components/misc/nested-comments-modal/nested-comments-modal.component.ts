import { Component, Input } from "@angular/core";
import { BaseComponentDirective } from "@shared/components/base-component.directive";
import { Store } from "@ngrx/store";
import { State } from "@app/store/state";
import { NgbActiveModal } from "@ng-bootstrap/ng-bootstrap";
import { TranslateService } from "@ngx-translate/core";
import { ContentTypeInterface } from "@shared/interfaces/content-type.interface";

@Component({
  selector: "astrobin-nested-comments-modal",
  templateUrl: "./nested-comments-modal.component.html"
})
export class NestedCommentsModalComponent extends BaseComponentDirective {
  @Input()
  contentType: ContentTypeInterface;

  @Input()
  objectId: number;

  @Input()
  highlightId: number;

  @Input()
  info: string;

  @Input()
  title: string = this.translateService.instant("Comments");

  @Input()
  addCommentLabel: string = this.translateService.instant("Add a comment");

  @Input()
  noCommentsLabel: string = this.translateService.instant("There are no comments yet.");

  constructor(
    public readonly store$: Store<State>,
    public readonly modal: NgbActiveModal,
    public readonly translateService: TranslateService
  ) {
    super(store$);
  }
}
