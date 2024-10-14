import { Component, Input } from "@angular/core";
import { UserInterface } from "@shared/interfaces/user.interface";
import { BaseComponentDirective } from "@shared/components/base-component.directive";
import { Store } from "@ngrx/store";
import { MainState } from "@app/store/state";
import { CollectionInterface } from "@shared/interfaces/collection.interface";
import { UserProfileInterface } from "@shared/interfaces/user-profile.interface";

@Component({
  selector: "astrobin-user-gallery-collection-thumbnail",
  template: `
    <ng-container *ngIf="currentUserWrapper$ | async as currentUserWrapper">
      <div class="collection-container">
        <div class="collection-background">
          <div class="collection-thumbnail">
            <img *ngIf="collection.coverThumbnail" [ngSrc]="collection.coverThumbnail" fill alt="" />
            <img
              *ngIf="!collection.coverThumbnail"
              [ngSrc]="'/assets/images/stars.jpg?v=20241008'"
              alt=""
              class="empty-collection-thumbnail"
              fill
            />
          </div>
        </div>

        <astrobin-user-gallery-collection-menu
          [user]="user"
          [userProfile]="userProfile"
          [collection]="collection"
        ></astrobin-user-gallery-collection-menu>

        <div class="collection-name">
          {{ collection.name }}
        </div>

        <div class="collection-count">
          {{ "{{ 0 }} images" | translate: {
          "0": currentUserWrapper.user?.id === collection.user ? collection.imageCountIncludingWip : collection.imageCount
          } }}
        </div>
      </div>
    </ng-container>
  `,
  styleUrls: ["./user-gallery-collection-thumbnail.component.scss"]
})
export class UserGalleryCollectionThumbnailComponent extends BaseComponentDirective {
  @Input() user: UserInterface;
  @Input() userProfile: UserProfileInterface;
  @Input() collection: CollectionInterface;

  constructor(
    public readonly store$: Store<MainState>
  ) {
    super(store$);
  }
}
