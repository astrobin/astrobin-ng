import type { ChangeDetectorRef, OnChanges, OnInit, SimpleChanges, TemplateRef } from "@angular/core";
import { ChangeDetectionStrategy, Component, Input, ViewChild } from "@angular/core";
import type { ActivatedRoute, Router } from "@angular/router";
import { selectCollections, selectCollectionsByParams } from "@app/store/selectors/app/collection.selectors";
import type { MainState } from "@app/store/state";
import type { CollectionInterface } from "@core/interfaces/collection.interface";
import type { UserProfileInterface } from "@core/interfaces/user-profile.interface";
import type { UserInterface } from "@core/interfaces/user.interface";
import type { DeviceService } from "@core/services/device.service";
import type { NgbOffcanvas } from "@ng-bootstrap/ng-bootstrap";
import type { Actions } from "@ngrx/effects";
import type { Store } from "@ngrx/store";
import { select } from "@ngrx/store";
import { BaseComponentDirective } from "@shared/components/base-component.directive";
import type { Subscription } from "rxjs";
import { filter, map, takeUntil } from "rxjs/operators";

@Component({
  selector: "astrobin-user-gallery-collections",
  template: `
    <ng-container *ngIf="currentUserWrapper$ | async as currentUserWrapper">
      <ng-container *ngIf="loading">
        <astrobin-loading-indicator></astrobin-loading-indicator>
      </ng-container>

      <div *ngIf="!loading && parentCollection" class="collection-header">
        <h2>
          <a
            [routerLink]="['/u', user.username]"
            [queryParams]="{ collection: parentCollection.parent }"
            [fragment]="userProfile.displayCollectionsOnPublicGallery ? 'gallery' : 'collections'"
            class="up"
          >
            <fa-icon icon="arrow-turn-up"></fa-icon>
          </a>

          <span class="collection-name">{{ parentCollection.name }}</span>

          <astrobin-user-gallery-collection-menu
            *ngIf="currentUserWrapper.user?.id === user.id"
            [user]="user"
            [userProfile]="userProfile"
            [collection]="parentCollection"
          ></astrobin-user-gallery-collection-menu>
        </h2>
        <p *ngIf="parentCollection.description" [innerHTML]="parentCollection.description" class="m-0 p-0"></p>
      </div>

      <div
        *ngIf="!loading && !parentCollection && collections?.length === 0 && currentUserWrapper.user?.id !== user.id"
      >
        <astrobin-nothing-here [withAlert]="false" [withInfoSign]="false"></astrobin-nothing-here>
      </div>

      <div
        *ngIf="!loading && (collections?.length > 0 || currentUserWrapper.user?.id === user.id)"
        class="d-flex flex-wrap gap-4 justify-content-center mb-5"
      >
        <a
          *ngFor="let collection of collections; trackBy: collectionTrackByFn"
          (click)="openCollection(collection)"
          astrobinEventPreventDefault
          astrobinEventStopPropagation
          class="d-block"
        >
          <astrobin-user-gallery-collection-thumbnail
            [user]="user"
            [userProfile]="userProfile"
            [collection]="collection"
          ></astrobin-user-gallery-collection-thumbnail>
        </a>

        <a
          *ngIf="currentUserWrapper.user?.id === user.id && !parentCollection"
          (click)="createCollection()"
          astrobinEventPreventDefault
          astrobinEventStopPropagation
          class="create-collection-button d-flex flex-column justify-content-center align-items-center text-center"
        >
          <fa-icon icon="plus" [ngbTooltip]="'Create collection'"></fa-icon>
        </a>
      </div>
    </ng-container>

    <ng-template #createCollectionOffcanvas let-offcanvas>
      <div class="offcanvas-header">
        <h5 class="offcanvas-title">{{ "Create collection" | translate }}</h5>
        <button type="button" class="btn-close" (click)="offcanvas.close()"></button>
      </div>
      <div class="offcanvas-body">
        <astrobin-user-gallery-collection-create
          [user]="user"
          [userProfile]="userProfile"
          [parent]="parentCollection"
          (cancelClick)="offcanvas.close()"
        ></astrobin-user-gallery-collection-create>
      </div>
    </ng-template>
  `,
  styleUrls: ["./user-gallery-collections.component.scss"],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class UserGalleryCollectionsComponent extends BaseComponentDirective implements OnInit, OnChanges {
  @Input() user: UserInterface;
  @Input() userProfile: UserProfileInterface;
  @Input() parent: CollectionInterface["id"] | null = null;

  @ViewChild("createCollectionOffcanvas") createCollectionOffcanvas: TemplateRef<any>;

  protected collections: CollectionInterface[] = null;
  protected parentCollection: CollectionInterface = null;
  protected loading = false;

  private _collectionsSubscription: Subscription;
  private _parentCollectionSubscription: Subscription;

  constructor(
    public readonly store$: Store<MainState>,
    public readonly actions$: Actions,
    public readonly activatedRoute: ActivatedRoute,
    public readonly router: Router,
    public readonly offcanvasService: NgbOffcanvas,
    public readonly deviceService: DeviceService,
    public readonly changeDetectorRef: ChangeDetectorRef
  ) {
    super(store$);
  }

  ngOnInit() {
    super.ngOnInit();
  }

  ngOnChanges(changes: SimpleChanges) {
    this.parentCollection = null;

    if (this._collectionsSubscription) {
      this._collectionsSubscription.unsubscribe();
    }

    this._collectionsSubscription = this.store$
      .pipe(
        select(
          selectCollectionsByParams({
            user: this.user.id,
            parent: this.activatedRoute.snapshot.queryParams.collection
              ? parseInt(this.activatedRoute.snapshot.queryParams.collection, 10)
              : null
          })
        ),
        takeUntil(this.destroyed$)
      )
      .subscribe(collections => {
        this.collections = collections;
        this.loading = false;
        this.changeDetectorRef.markForCheck();
      });

    if (this.parent) {
      if (this._parentCollectionSubscription) {
        this._parentCollectionSubscription.unsubscribe();
      }

      this._parentCollectionSubscription = this.store$
        .pipe(
          select(selectCollections),
          filter(collections => collections?.length > 0),
          map(collections => collections.filter(collection => collection.id === this.parent)),
          takeUntil(this.destroyed$)
        )
        .subscribe(collections => {
          this.parentCollection = collections[0];
          this.changeDetectorRef.markForCheck();
        });
    }
  }

  protected openCollection(collection: CollectionInterface) {
    this.router.navigate([], {
      fragment: this.userProfile.displayCollectionsOnPublicGallery ? "gallery" : "collections",
      queryParams: { collection: collection.id },
      relativeTo: this.activatedRoute
    });
  }

  protected createCollection() {
    this.offcanvasService.open(this.createCollectionOffcanvas, {
      position: this.deviceService.offcanvasPosition()
    });
  }

  protected collectionTrackByFn(index: number, item: CollectionInterface): CollectionInterface["id"] {
    return item.id;
  }
}
