import { Component, Input, OnChanges, OnInit, SimpleChanges } from "@angular/core";
import { UserInterface } from "@shared/interfaces/user.interface";
import { BaseComponentDirective } from "@shared/components/base-component.directive";
import { Store } from "@ngrx/store";
import { MainState } from "@app/store/state";
import { CollectionInterface } from "@shared/interfaces/collection.interface";
import { UserProfileInterface } from "@shared/interfaces/user-profile.interface";
import { UserGalleryActiveLayout } from "@features/users/pages/gallery/user-gallery-buttons.component";

@Component({
  selector: "astrobin-user-gallery-collection",
  template: `
    <ng-container *ngIf="currentUserWrapper$ | async as currentUserWrapper">
      <astrobin-user-gallery-buttons [(activeLayout)]="activeLayout"></astrobin-user-gallery-buttons>

      <div class="collection-header">
        <h2>{{ collection.name }}</h2>
        <small>
          <span>{{ "A collection by {{ 0 }}" | translate: { "0": user.displayName } }}</span>
          <span>&middot;</span>
          <span>{{ "{{ 0 }} images" | translate: { "0": collection.imageCount } }}</span>
        </small>
      </div>

      <div
        *ngIf="collection.description"
        [innerHTML]="collection.description"
        class="collection-description"
      >
      </div>

      <astrobin-user-gallery-images
        *ngIf="collection"
        [activeLayout]="activeLayout"
        [user]="user"
        [userProfile]="userProfile"
        [options]="{ collection: collection.id }"
        [expectedImagesCount]="collection.imageCount"
      ></astrobin-user-gallery-images>
    </ng-container>
  `,
  styleUrls: ["./user-gallery-collection.component.scss"]
})
export class UserGalleryCollectionComponent extends BaseComponentDirective implements OnInit, OnChanges {
  @Input() user: UserInterface;
  @Input() userProfile: UserProfileInterface;
  @Input() collection: CollectionInterface;

  protected activeLayout: UserGalleryActiveLayout = UserGalleryActiveLayout.SMALL;

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
