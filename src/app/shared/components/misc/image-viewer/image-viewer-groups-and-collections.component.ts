import {
  ChangeDetectorRef,
  OnChanges,
  SimpleChanges,
  TemplateRef,
  ChangeDetectionStrategy,
  Component,
  Input,
  ViewChild
} from "@angular/core";
import { LoadCollections } from "@app/store/actions/collection.actions";
import { LoadGroups } from "@app/store/actions/group.actions";
import { selectCollectionsByParams } from "@app/store/selectors/app/collection.selectors";
import { selectGroupsByParams } from "@app/store/selectors/app/group.selectors";
import { MainState } from "@app/store/state";
import { CollectionInterface } from "@core/interfaces/collection.interface";
import { GroupInterface } from "@core/interfaces/group.interface";
import { ImageInterface } from "@core/interfaces/image.interface";
import { UserProfileInterface } from "@core/interfaces/user-profile.interface";
import { ClassicRoutesService } from "@core/services/classic-routes.service";
import { DeviceService } from "@core/services/device.service";
import { UserService } from "@core/services/user.service";
import { LoadUser, LoadUserProfile } from "@features/account/store/auth.actions";
import { selectUser, selectUserProfile } from "@features/account/store/auth.selectors";
import { NgbOffcanvas } from "@ng-bootstrap/ng-bootstrap";
import { select, Store } from "@ngrx/store";
import { BaseComponentDirective } from "@shared/components/base-component.directive";
import { filter, take, takeUntil } from "rxjs/operators";

@Component({
  selector: "astrobin-image-viewer-groups-and-collections",
  template: `
    <div class="metadata-section">
      <div *ngIf="image.partOfGroupSet.length > 0" class="metadata-item">
        <div class="metadata-icon">
          <fa-icon [ngbTooltip]="'Groups' | translate" container="body" icon="users" triggers="hover click"></fa-icon>
        </div>
        <div (click)="openGroupsOffcanvas()" class="metadata-link">
          <ng-container *ngIf="image.partOfGroupSet.length === 1; else pluralGroupsTemplate">
            {{ "In 1 group" | translate }}
          </ng-container>
          <ng-template #pluralGroupsTemplate>
            {{ "In {{ 0 }} groups" | translate: { "0": image.partOfGroupSet.length } }}
          </ng-template>
        </div>
      </div>

      <div *ngIf="image.collections.length > 0" class="metadata-item">
        <div class="metadata-icon">
          <fa-icon
            [ngbTooltip]="'Collections' | translate"
            container="body"
            icon="folder"
            triggers="hover click"
          ></fa-icon>
        </div>
        <div (click)="openCollectionsOffcanvas()" class="metadata-link">
          <ng-container *ngIf="image.collections.length === 1; else pluralCollectionsTemplate">
            {{ "In 1 collection" | translate }}
          </ng-container>
          <ng-template #pluralCollectionsTemplate>
            {{ "In {{ 0 }} collections" | translate: { "0": image.collections.length } }}
          </ng-template>
        </div>
      </div>
    </div>

    <ng-template #groupsOffcanvasTemplate let-offcanvas>
      <div class="offcanvas-header">
        <h4 class="offcanvas-title">{{ "Groups" | translate }}</h4>
        <button (click)="offcanvas.close()" class="close" aria-label="Close" type="button">
          <span aria-hidden="true">&times;</span>
        </button>
      </div>
      <div class="offcanvas-body">
        <div *ngIf="groups; else loadingTemplate" class="d-flex flex-column gap-2">
          <div *ngFor="let group of groups" class="w-100">
            <a [href]="classicRoutesService.GROUP(group.id)">
              {{ group.name }}
            </a>
          </div>
        </div>
      </div>
    </ng-template>

    <ng-template #collectionsOffcanvasTemplate let-offcanvas>
      <div class="offcanvas-header">
        <h4 class="offcanvas-title">{{ "Collections" | translate }}</h4>
        <button (click)="offcanvas.close()" class="close" aria-label="Close" type="button">
          <span aria-hidden="true">&times;</span>
        </button>
      </div>
      <div class="offcanvas-body">
        <ng-container *ngIf="currentUserWrapper$ | async as currentUserWrapper">
          <div *ngIf="collections; else loadingTemplate" class="d-flex flex-column gap-2">
            <div *ngFor="let collection of collections" class="d-flex justify-content-between align-items-center w-100">
              <div class="d-flex flex-column gap-1">
                <a
                  [href]="
                    userService.getCollectionUrl(
                      collection.username,
                      collection.id,
                      !currentUserWrapper.userProfile || currentUserWrapper.userProfile.enableNewGalleryExperience,
                      collection.displayCollectionsOnPublicGallery
                    )
                  "
                  (click)="
                    userService.openCollection(
                      collection.username,
                      collection.id,
                      !currentUserWrapper.userProfile || currentUserWrapper.userProfile.enableNewGalleryExperience,
                      collection.displayCollectionsOnPublicGallery
                    )
                  "
                  astrobinEventPreventDefault
                >
                  {{ collection.name }}
                </a>

                <span *ngIf="collection.user !== image.user" class="text-muted collection-user">
                  {{ collection.userDisplayName }}
                </span>
              </div>

              <span class="image-count">
                <ng-container *ngIf="currentUserWrapper.user?.id === collection.user">
                  <ng-container *ngIf="collection.imageCountIncludingWip === 1">
                    {{ "1 image" | translate }}
                  </ng-container>
                  <ng-container *ngIf="collection.imageCountIncludingWip > 1">
                    {{ "{{0}} images" | translate: { "0": collection.imageCountIncludingWip } }}
                  </ng-container>
                </ng-container>

                <ng-container *ngIf="currentUserWrapper.user?.id !== collection.user">
                  <ng-container *ngIf="collection.imageCount === 1">
                    {{ "1 image" | translate }}
                  </ng-container>
                  <ng-container *ngIf="collection.imageCount > 1">
                    {{ "{{0}} images" | translate: { "0": collection.imageCount } }}
                  </ng-container>
                </ng-container>
              </span>
            </div>
          </div>
        </ng-container>
      </div>
    </ng-template>

    <ng-template #loadingTemplate>
      <astrobin-loading-indicator></astrobin-loading-indicator>
    </ng-template>
  `,
  styles: [
    `
      .collection-user {
        font-size: 0.85rem;
      }
    `
  ],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ImageViewerGroupsAndCollectionsComponent extends BaseComponentDirective implements OnChanges {
  @Input() image: ImageInterface;

  @ViewChild("groupsOffcanvasTemplate", { static: true }) groupsOffcanvasTemplate: TemplateRef<any>;
  @ViewChild("collectionsOffcanvasTemplate", { static: true }) collectionsOffcanvasTemplate: TemplateRef<any>;

  protected groups: GroupInterface[] = null;
  protected collections: CollectionInterface[] = null;
  protected userProfile: UserProfileInterface = null;

  constructor(
    public readonly store$: Store<MainState>,
    public readonly classicRoutesService: ClassicRoutesService,
    public readonly offcanvasService: NgbOffcanvas,
    public readonly deviceService: DeviceService,
    public readonly userService: UserService,
    public readonly changeDetectorRef: ChangeDetectorRef
  ) {
    super(store$);
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes.image && changes.image.currentValue) {
      this.store$
        .select(selectUser, this.image.user)
        .pipe(
          filter(user => !!user),
          take(1)
        )
        .subscribe(user => {
          this.store$
            .select(selectUserProfile, user.userProfile)
            .pipe(
              filter(userProfile => !!userProfile),
              take(1)
            )
            .subscribe(userProfile => {
              this.userProfile = userProfile;
              this.changeDetectorRef.markForCheck();
            });
          this.store$.dispatch(new LoadUserProfile({ id: user.userProfile }));
        });
      this.store$.dispatch(new LoadUser({ id: this.image.user }));
    }
  }

  protected openGroupsOffcanvas() {
    this._loadGroups();
    this.offcanvasService.open(this.groupsOffcanvasTemplate, {
      panelClass: "image-viewer-offcanvas",
      backdropClass: "image-viewer-offcanvas-backdrop",
      position: this.deviceService.offcanvasPosition()
    });
  }

  protected openCollectionsOffcanvas() {
    this._loadCollections();
    this.offcanvasService.open(this.collectionsOffcanvasTemplate, {
      panelClass: "image-viewer-offcanvas",
      backdropClass: "image-viewer-offcanvas-backdrop",
      position: this.deviceService.offcanvasPosition()
    });
  }

  private _loadGroups() {
    this.store$
      .pipe(
        select(selectGroupsByParams({ ids: this.image.partOfGroupSet })),
        filter(groups => !!groups),
        takeUntil(this.destroyed$)
      )
      .subscribe(groups => {
        this.groups = groups;
        this.changeDetectorRef.markForCheck();
      });

    this.store$.dispatch(new LoadGroups({ params: { ids: this.image.partOfGroupSet } }));
  }

  private _loadCollections() {
    this.store$
      .pipe(
        select(selectCollectionsByParams({ ids: this.image.collections })),
        filter(collections => !!collections),
        takeUntil(this.destroyed$)
      )
      .subscribe(collections => {
        this.collections = collections;
        this.changeDetectorRef.markForCheck();
      });

    this.store$.dispatch(new LoadCollections({ params: { ids: this.image.collections } }));
  }
}
