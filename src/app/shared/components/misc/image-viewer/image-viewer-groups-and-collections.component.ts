import { ChangeDetectionStrategy, ChangeDetectorRef, Component, Input, OnChanges, SimpleChanges, TemplateRef, ViewChild } from "@angular/core";
import { ImageInterface } from "@shared/interfaces/image.interface";
import { GroupInterface } from "@shared/interfaces/group.interface";
import { CollectionInterface } from "@shared/interfaces/collection.interface";
import { MainState } from "@app/store/state";
import { select, Store } from "@ngrx/store";
import { LoadGroups } from "@app/store/actions/group.actions";
import { selectGroupsByParams } from "@app/store/selectors/app/group.selectors";
import { filter, takeUntil } from "rxjs/operators";
import { BaseComponentDirective } from "@shared/components/base-component.directive";
import { LoadCollections } from "@app/store/actions/collection.actions";
import { selectCollectionsByParams } from "@app/store/selectors/app/collection.selectors";
import { ClassicRoutesService } from "@shared/services/classic-routes.service";
import { NgbOffcanvas } from "@ng-bootstrap/ng-bootstrap";
import { DeviceService } from "@shared/services/device.service";
import { UserService } from "@shared/services/user.service";

@Component({
  selector: "astrobin-image-viewer-groups-and-collections",
  template: `
    <div class="metadata-section">
      <div *ngIf="image.partOfGroupSet.length > 0" class="metadata-item">
        <div class="metadata-icon">
          <fa-icon
            [ngbTooltip]="'Groups' | translate"
            triggers="hover click"
            container="body"
            icon="users"
          ></fa-icon>
        </div>
        <div class="metadata-link" (click)="openGroupsOffcanvas()">
          <ng-container
            *ngIf="image.partOfGroupSet.length === 1; else pluralGroupsTemplate"
          >
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
            triggers="hover click"
            container="body"
            icon="folder"
          ></fa-icon>
        </div>
        <div class="metadata-link" (click)="openCollectionsOffcanvas()">
          <ng-container
            *ngIf="image.collections.length === 1; else pluralCollectionsTemplate"
          >
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
        <button type="button" class="close" aria-label="Close" (click)="offcanvas.close()">
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
        <button type="button" class="close" aria-label="Close" (click)="offcanvas.close()">
          <span aria-hidden="true">&times;</span>
        </button>
      </div>
      <div class="offcanvas-body">
        <ng-container *ngIf="currentUserWrapper$ | async as currentUserWrapper">
          <div *ngIf="collections; else loadingTemplate" class="d-flex flex-column gap-2">
            <div *ngFor="let collection of collections" class="w-100">
              <a
                (click)="userService.openCollection(image.username, collection.id, currentUserWrapper.userProfile?.enableNewGalleryExperience)"
                [href]="userService.getCollectionUrl(image.username, collection.id, currentUserWrapper.userProfile?.enableNewGalleryExperience)"
                astrobinEventPreventDefault
              >
                {{ collection.name }}
              </a>
            </div>
          </div>
        </ng-container>
      </div>
    </ng-template>

    <ng-template #loadingTemplate>
      <astrobin-loading-indicator></astrobin-loading-indicator>
    </ng-template>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ImageViewerGroupsAndCollectionsComponent extends BaseComponentDirective implements OnChanges {
  @Input() image: ImageInterface;

  @ViewChild("groupsOffcanvasTemplate", { static: true }) groupsOffcanvasTemplate: TemplateRef<any>;
  @ViewChild("collectionsOffcanvasTemplate", { static: true }) collectionsOffcanvasTemplate: TemplateRef<any>;

  protected groups: GroupInterface[] = null;
  protected collections: CollectionInterface[] = null;

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
    }
  }

  protected openGroupsOffcanvas() {
    this._loadGroups();
    this.offcanvasService.open(this.groupsOffcanvasTemplate, {
      position: this.deviceService.offcanvasPosition()
    });
  }

  protected openCollectionsOffcanvas() {
    this._loadCollections();
    this.offcanvasService.open(this.collectionsOffcanvasTemplate, {
      position: this.deviceService.offcanvasPosition()
    });
  }

  private _loadGroups() {
    this.store$.pipe(
      select(selectGroupsByParams({ ids: this.image.partOfGroupSet })),
      filter(groups => !!groups),
      takeUntil(this.destroyed$)
    ).subscribe(groups => {
      this.groups = groups;
      this.changeDetectorRef.markForCheck();
    });

    this.store$.dispatch(new LoadGroups({ params: { ids: this.image.partOfGroupSet } }));
  }

  private _loadCollections() {
    this.store$.pipe(
      select(selectCollectionsByParams({ ids: this.image.collections })),
      filter(collections => !!collections),
      takeUntil(this.destroyed$)
    ).subscribe(collections => {
      this.collections = collections;
      this.changeDetectorRef.markForCheck();
    });

    this.store$.dispatch(new LoadCollections({ params: { ids: this.image.collections } }));
  }
}
