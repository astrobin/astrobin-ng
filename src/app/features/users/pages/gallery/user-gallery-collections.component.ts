import { Component, Input, OnChanges, OnInit, SimpleChanges } from "@angular/core";
import { UserInterface } from "@shared/interfaces/user.interface";
import { BaseComponentDirective } from "@shared/components/base-component.directive";
import { select, Store } from "@ngrx/store";
import { MainState } from "@app/store/state";
import { CollectionInterface } from "@shared/interfaces/collection.interface";
import { LoadCollections } from "@app/store/actions/collection.actions";
import { selectCollections } from "@app/store/selectors/app/collection.selectors";
import { filter, takeUntil } from "rxjs/operators";
import { ActivatedRoute, NavigationEnd, Router } from "@angular/router";
import { Actions } from "@ngrx/effects";
import { UserProfileInterface } from "@shared/interfaces/user-profile.interface";

@Component({
  selector: "astrobin-user-gallery-collections",
  template: `
    <ng-container *ngIf="currentUserWrapper$ | async as currentUserWrapper">
      <ng-container *ngIf="loading">
        <astrobin-loading-indicator></astrobin-loading-indicator>
      </ng-container>

      <astrobin-nothing-here
        *ngIf="!loading && collections?.length === 0"
        [withAlert]="false"
        [withInfoSign]="false"
      ></astrobin-nothing-here>

      <div *ngIf="!loading && activeCollection">
        <astrobin-user-gallery-collection
          [user]="user"
          [userProfile]="userProfile"
          [collection]="activeCollection"
        ></astrobin-user-gallery-collection>
      </div>

      <div
        *ngIf="!loading && !activeCollection && collections?.length > 0"
        class="d-flex flex-wrap gap-4"
      >
        <a
          *ngFor="let collection of collections"
          (click)="openCollection(collection)"
          astrobinEventPreventDefault
          astrobinEventStopPropagation
          class="d-block"
        >
          <astrobin-user-gallery-collection-thumbnail
            [user]="user"
            [collection]="collection"
          ></astrobin-user-gallery-collection-thumbnail>
        </a>
      </div>
    </ng-container>
  `,
  styleUrls: ["./user-gallery-images.component.scss"]
})
export class UserGalleryCollectionsComponent extends BaseComponentDirective implements OnInit, OnChanges {
  @Input() user: UserInterface;
  @Input() userProfile: UserProfileInterface

  protected activeCollection: CollectionInterface | null = null;
  protected collections: CollectionInterface[] = [];
  protected loading = false;

  private _parent: CollectionInterface["id"] | null = null;


  constructor(
    public readonly store$: Store<MainState>,
    public readonly actions$: Actions,
    public readonly activatedRoute: ActivatedRoute,
    public readonly router: Router
  ) {
    super(store$);

    router.events.pipe(
      filter(event => event instanceof NavigationEnd),
      takeUntil(this.destroyed$)
    ).subscribe(() => {
      this._setActiveCollectionFromRoute();
    });
  }

  ngOnInit() {
    super.ngOnInit();

    this.store$.pipe(
      select(selectCollections, { user: this.user.id, parent: this._parent }),
      takeUntil(this.destroyed$)
    ).subscribe(collections => {
      this.collections = collections;
      this._setActiveCollectionFromRoute();
      this.loading = false;
    });
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes.user) {
      this.loading = true;
      this.store$.dispatch(new LoadCollections({
        params: {
          user: this.user.id,
          parent: this._parent
        }
      }));
    }
  }

  openCollection(collection: CollectionInterface) {
    this.router.navigate(
      [],
      {
        fragment: "collections",
        queryParams: { collection: collection.id },
        relativeTo: this.activatedRoute
      }
    ).then(() => {
      this.activeCollection = collection;
    });
  }

  private _setActiveCollectionFromRoute() {
    const collectionId = this.activatedRoute.snapshot.queryParams.collection;

    if (this.collections && this.collections.length > 0) {
      this.activeCollection = this.collections.find(collection => collection.id === +collectionId) || null;
    }
  }
}
