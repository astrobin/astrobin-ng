import { Component, Input, OnInit } from "@angular/core";
import { BaseComponentDirective } from "@shared/components/base-component.directive";
import { Store } from "@ngrx/store";
import { State } from "@app/store/state";
import { NgbActiveModal } from "@ng-bootstrap/ng-bootstrap";
import { TranslateService } from "@ngx-translate/core";
import { ContentTypeInterface } from "@shared/interfaces/content-type.interface";

@Component({
  selector: "astrobin-iotd-comments-modal",
  templateUrl: "./nested-comments-modal.component.html"
})
export class NestedCommentsModalComponent extends BaseComponentDirective implements OnInit {
  @Input()
  contentType: ContentTypeInterface;

  @Input()
  objectId: number;

  @Input()
  highlightId: number;

  @Input()
  info: string;

  constructor(
    public readonly store$: Store<State>,
    public readonly modal: NgbActiveModal,
    public readonly translateService: TranslateService
  ) {
    super(store$);
  }

  ngOnInit(): void {}
}
