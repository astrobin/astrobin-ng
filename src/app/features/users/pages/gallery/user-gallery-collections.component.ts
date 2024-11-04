import { Component, Input, OnChanges, OnInit, SimpleChanges, TemplateRef, ViewChild } from "@angular/core";
import { UserInterface } from "@shared/interfaces/user.interface";
import { BaseComponentDirective } from "@shared/components/base-component.directive";
import { select, Store } from "@ngrx/store";
import { MainState } from "@app/store/state";
import { CollectionInterface } from "@shared/interfaces/collection.interface";
import { selectCollections, selectCollectionsByParams } from "@app/store/selectors/app/collection.selectors";
import { filter, map, takeUntil } from "rxjs/operators";
import { ActivatedRoute, Router } from "@angular/router";
import { Actions } from "@ngrx/effects";
import { UserProfileInterface } from "@shared/interfaces/user-profile.interface";
import { Subscription } from "rxjs";
import { NgbOffcanvas } from "@ng-bootstrap/ng-bootstrap";
import { DeviceService } from "@shared/services/device.service";

@Component({
  selector: "astrobin-user-gallery-collections",
  template: `
    <ng-container *ngIf="currentUserWrapper$ | async as currentUserWrapper">
      <ng-container *ngIf="loading">
        <astrobin-loading-indicator></astrobin-loading-indicator>
      </ng-container>

      <div *ngIf="!loading && parentCollection" class="collection-header">
        <div class="mb-2 up">
          <a
            [routerLink]="['/u', user.username]"
            [queryParams]="{ collection: parentCollection.parent }"
            fragment="gallery"
          >
            <fa-icon icon="arrow-circle-up"></fa-icon>
          </a>
        </div>

        <h2>
          {{ parentCollection.name }}

          <astrobin-user-gallery-collection-menu
            *ngIf="currentUserWrapper.user?.id === user.id"
            [user]="user"
            [userProfile]="userProfile"
            [collection]="parentCollection"
          ></astrobin-user-gallery-collection-menu>
        </h2>
        <small>{{ "A collection by {{ 0 }}" | translate: {"0": user.displayName} }}</small>
        <p *ngIf="parentCollection.description" [innerHTML]="parentCollection.description"></p>
      </div>

      <div
        *ngIf="!loading && collections?.length > 0"
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
          *ngIf="currentUserWrapper.user?.id === user.id"
          (click)="createCollection()"
          astrobinEventPreventDefault
          astrobinEventStopPropagation
          class="create-collection-button"
        >
          <fa-icon
            icon="plus"
            [ngbTooltip]="'Create new collection'"
          ></fa-icon>
        </a>
      </div>
    </ng-container>

    <ng-template #createCollectionOffcanvas let-offcanvas>
      <div class="offcanvas-header">
        <h5 class="offcanvas-title">{{ "Create new collection" | translate }}</h5>
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
  styleUrls: ["./user-gallery-collections.component.scss"]
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
    public readonly deviceService: DeviceService
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

    this._collectionsSubscription = this.store$.pipe(
      select(selectCollectionsByParams({
        user: this.user.id,
        parent: this.activatedRoute.snapshot.queryParams.collection
          ? parseInt(this.activatedRoute.snapshot.queryParams.collection, 10)
          : null
      })),
      takeUntil(this.destroyed$)
    ).subscribe(collections => {
      this.collections = collections;
      this.loading = false;
    });

    if (this.parent) {
      if (this._parentCollectionSubscription) {
        this._parentCollectionSubscription.unsubscribe();
      }

      this._parentCollectionSubscription = this.store$.pipe(
        select(selectCollections),
        filter(collections => collections?.length > 0),
        map(collections => collections.filter(collection => collection.id === this.parent)),
        takeUntil(this.destroyed$)
      ).subscribe(collections => {
        this.parentCollection = collections[0];
      });
    }
  }

  protected openCollection(collection: CollectionInterface) {
    this.router.navigate(
      [],
      {
        fragment: "gallery",
        queryParams: { collection: collection.id },
        relativeTo: this.activatedRoute
      }
    );
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
