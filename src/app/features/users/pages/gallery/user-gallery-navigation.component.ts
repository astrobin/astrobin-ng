import { Component, Input } from "@angular/core";
import { UserInterface } from "@shared/interfaces/user.interface";
import { BaseComponentDirective } from "@shared/components/base-component.directive";
import { Store } from "@ngrx/store";
import { MainState } from "@app/store/state";
import { ImageAlias } from "@shared/enums/image-alias.enum";

type GalleryNavigationComponent = "recent" | "collections" | "staging" | "about";

@Component({
  selector: "astrobin-user-gallery-navigation",
  template: `
    <ng-container *ngIf="currentUserWrapper$ | async as currentUserWrapper">
      <ul
        ngbNav
        #nav="ngbNav"
        [(activeId)]="active"
        class="nav-tabs"
      >
        <li ngbNavItem="recent">
          <a ngbNavLink translate="Recent images"></a>
          <ng-template ngbNavContent>
            <astrobin-image-search
              [model]="{ userId: user.id, ordering: '-published', pageSize: 50 }"
              [loadMoreOnScroll]="true"
              [showRetailers]="false"
              [showMarketplaceItems]="false"
            ></astrobin-image-search>
          </ng-template>
        </li>

        <li *ngIf="currentUserWrapper.user?.id === user.id" ngbNavItem="staging">
          <a ngbNavLink translate="Staging area"></a>
          <ng-template ngbNavContent>
          </ng-template>
        </li>

        <li ngbNavItem="collections">
          <a ngbNavLink translate="Collections"></a>
          <ng-template ngbNavContent>
          </ng-template>
        </li>

        <li ngbNavItem="about">
          <a ngbNavLink translate="About"></a>
          <ng-template ngbNavContent>
          </ng-template>
        </li>
      </ul>

      <div [ngbNavOutlet]="nav"></div>
    </ng-container>
  `,
  styleUrls: ["./user-gallery-navigation.component.scss"]
})
export class UserGalleryNavigationComponent extends BaseComponentDirective {
  @Input() user: UserInterface;

  protected active: GalleryNavigationComponent;

  constructor(public readonly store$: Store<MainState>) {
    super(store$);
  }

  protected readonly ImageAlias = ImageAlias;
}
