import { Component, Input, OnChanges, OnInit, SimpleChanges } from "@angular/core";
import { UserInterface } from "@shared/interfaces/user.interface";
import { BaseComponentDirective } from "@shared/components/base-component.directive";
import { select, Store } from "@ngrx/store";
import { MainState } from "@app/store/state";
import { CollectionInterface } from "@shared/interfaces/collection.interface";
import { LoadCollections } from "@app/store/actions/collection.actions";
import { selectCollections } from "@app/store/selectors/app/collection.selectors";
import { takeUntil } from "rxjs/operators";

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

      <div
        *ngIf="!loading && collections?.length > 0"
      >
        <a
          *ngFor="let collection of collections"
        >
          {{ collection.name }}
        </a>
      </div>
    </ng-container>
  `,
  styleUrls: ["./user-gallery-images.component.scss"]
})
export class UserGalleryCollectionsComponent
  extends BaseComponentDirective implements OnInit, OnChanges {
  @Input() user: UserInterface;

  parent: CollectionInterface["id"] | null = null;
  protected collections: CollectionInterface[] = [];
  protected loading = false;

  constructor(
    public readonly store$: Store<MainState>
  ) {
    super(store$);
  }

  ngOnInit() {
    super.ngOnInit();

    this.store$.pipe(
      select(selectCollections, { user: this.user.id, parent: this.parent }),
      takeUntil(this.destroyed$)
    ).subscribe(collections => {
      this.collections = collections;
      this.loading = false;
    })
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes.user) {
      this.loading = true;
      this.store$.dispatch(new LoadCollections({
        params: {
          user: this.user.id,
          parent: this.parent
        }
      }));
    }
  }
}
