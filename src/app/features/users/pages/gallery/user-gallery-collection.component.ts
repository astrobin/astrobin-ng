import { Component, Input, OnChanges, OnInit, SimpleChanges } from "@angular/core";
import { UserInterface } from "@shared/interfaces/user.interface";
import { BaseComponentDirective } from "@shared/components/base-component.directive";
import { Store } from "@ngrx/store";
import { MainState } from "@app/store/state";
import { CollectionInterface } from "@shared/interfaces/collection.interface";

@Component({
  selector: "astrobin-user-gallery-collection",
  template: `
    <ng-container *ngIf="currentUserWrapper$ | async as currentUserWrapper">
    </ng-container>
  `,
  styleUrls: ["./user-gallery-collection.component.scss"]
})
export class UserGalleryCollectionsComponent
  extends BaseComponentDirective implements OnInit, OnChanges {
  @Input() user: UserInterface;
  @Input() collection: CollectionInterface;


  constructor(
    public readonly store$: Store<MainState>
  ) {
    super(store$);
  }

  ngOnInit() {
    super.ngOnInit();
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes.user) {
    }
  }
}
