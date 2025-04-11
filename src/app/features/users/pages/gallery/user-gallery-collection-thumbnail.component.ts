import { ChangeDetectionStrategy, Component, Input } from "@angular/core";
import { MainState } from "@app/store/state";
import { ImageAlias } from "@core/enums/image-alias.enum";
import { CollectionInterface } from "@core/interfaces/collection.interface";
import { UserProfileInterface } from "@core/interfaces/user-profile.interface";
import { UserInterface } from "@core/interfaces/user.interface";
import { ImageService } from "@core/services/image/image.service";
import { Store } from "@ngrx/store";
import { BaseComponentDirective } from "@shared/components/base-component.directive";

@Component({
  selector: "astrobin-user-gallery-collection-thumbnail",
  template: `
    <ng-container *ngIf="currentUserWrapper$ | async as currentUserWrapper">
      <div class="collection-container">
        <div class="collection-background">
          <div class="collection-thumbnail h-100">
            <ng-container *ngIf="collection.coverThumbnail">
              <ng-container *ngIf="imageService.getObjectFit(collection) as fit">
                <div
                  [astrobinLazyBackground]="collection.coverThumbnail"
                  [attr.aria-label]="collection.name"
                  [highResolutionUrl]="collection.coverThumbnailHd"
                  [ngStyle]="{
                    'background-position': fit.position.x + '% ' + fit.position.y + '%',
                    'background-size': fit.scale > 1.5 ? fit.scale * 100 + '%' : 'cover',
                    'background-repeat': 'no-repeat'
                  }"
                  [useHighResolution]="fit.scale > 3"
                  role="img"
                ></div>
              </ng-container>
            </ng-container>

            <img
              *ngIf="!collection.coverThumbnail"
              [ngSrc]="'/assets/images/stars.jpg?v=20241008'"
              class="empty-collection-thumbnail"
              alt=""
              fill
            />
          </div>
        </div>

        <astrobin-user-gallery-collection-menu
          *ngIf="currentUserWrapper.user?.id === collection.user"
          [collection]="collection"
          [user]="user"
          [userProfile]="userProfile"
        ></astrobin-user-gallery-collection-menu>

        <div class="collection-name">
          {{ collection.name }}
        </div>

        <div class="image-count">
          <ng-container *ngIf="currentUserWrapper.user?.id === collection.user">
            <ng-container *ngIf="collection.imageCountIncludingWip === 0">
              {{ "No images" | translate }}
            </ng-container>

            <ng-container *ngIf="collection.imageCountIncludingWip === 1">
              {{ "1 image" | translate }}
            </ng-container>

            <ng-container *ngIf="collection.imageCountIncludingWip > 1">
              {{ "{{ 0 }} images" | translate: { "0": collection.imageCountIncludingWip } }}
            </ng-container>
          </ng-container>

          <ng-container *ngIf="currentUserWrapper.user?.id !== collection.user">
            <ng-container *ngIf="collection.imageCount === 0">
              {{ "No images" | translate }}
            </ng-container>

            <ng-container *ngIf="collection.imageCount === 1">
              {{ "1 image" | translate }}
            </ng-container>

            <ng-container *ngIf="collection.imageCount > 1">
              {{ "{{ 0 }} images" | translate: { "0": collection.imageCount } }}
            </ng-container>
          </ng-container>
        </div>

        <div *ngIf="collection.nestedCollectionCount" class="nested-collection-count">
          <ng-container *ngIf="collection.nestedCollectionCount === 1">
            {{ "1 collection" | translate }}
          </ng-container>

          <ng-container *ngIf="collection.nestedCollectionCount > 1">
            {{ "{{ 0 }} collections" | translate: { "0": collection.nestedCollectionCount } }}
          </ng-container>
        </div>
      </div>
    </ng-container>
  `,
  styleUrls: ["./user-gallery-collection-thumbnail.component.scss"],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class UserGalleryCollectionThumbnailComponent extends BaseComponentDirective {
  @Input() user: UserInterface;
  @Input() userProfile: UserProfileInterface;
  @Input() collection: CollectionInterface;

  constructor(
    public readonly store$: Store<MainState>,
    public readonly imageService: ImageService
  ) {
    super(store$);
  }

  protected readonly ImageAlias = ImageAlias;
}
