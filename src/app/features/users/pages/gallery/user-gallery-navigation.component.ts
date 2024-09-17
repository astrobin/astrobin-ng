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
          <a ngbNavLink>
            <fa-icon icon="images" class="me-2"></fa-icon>
            <span translate="Recent images"></span>
          </a>
          <ng-template ngbNavContent>
            <astrobin-user-gallery-images
              [user]="user"
            ></astrobin-user-gallery-images>
          </ng-template>
        </li>

        <li *ngIf="currentUserWrapper.user?.id === user.id" ngbNavItem="staging">
          <a ngbNavLink>
            <fa-icon icon="lock" class="me-2"></fa-icon>
            <span translate="Staging area"></span>
          </a>
          <ng-template ngbNavContent>
            <astrobin-user-gallery-images
              [user]="user"
              [options]="{ staging: true }"
            ></astrobin-user-gallery-images>
          </ng-template>
        </li>

        <li ngbNavItem="collections">
          <a ngbNavLink>
            <fa-icon icon="folder" class="me-2"></fa-icon>
            <span translate="Collections"></span>
          </a>
          <ng-template ngbNavContent>
          </ng-template>
        </li>

        <li ngbNavItem="about">
          <a ngbNavLink>
            <fa-icon icon="user" class="me-2"></fa-icon>
            <span translate="About"></span>
          </a>
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
