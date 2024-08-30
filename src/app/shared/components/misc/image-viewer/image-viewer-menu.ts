import { Component, Input } from "@angular/core";
import { Store } from "@ngrx/store";
import { BaseComponentDirective } from "@shared/components/base-component.directive";
import { MainState } from "@app/store/state";
import { ImageInterface } from "@shared/interfaces/image.interface";
import { ClassicRoutesService } from "@shared/services/classic-routes.service";
import { Actions, ofType } from "@ngrx/effects";
import { AppActionTypes } from "@app/store/actions/app.actions";
import { filter, take } from "rxjs/operators";
import { PublishImage, PublishImageSuccess, UnpublishImage, UnpublishImageSuccess } from "@app/store/actions/image.actions";
import { PopNotificationsService } from "@shared/services/pop-notifications.service";

@Component({
  selector: "astrobin-image-viewer-menu",
  template: `
    <ng-container *ngIf="currentUserWrapper$ | async as currentUserWrapper">
      <a
        [href]="classicRoutesService.IMAGE(image.hash || image.pk.toString())"
        [class]="itemClass"
      >
        {{ "Classic view" | translate }}
      </a>

      <ng-container *ngIf="currentUserWrapper.user?.id === image.user">
        <div [class]="dividerClass"></div>

        <a
          [routerLink]="['/i', image.hash || image.pk.toString(), 'edit']"
          [class]="itemClass"
        >
          {{ "Edit" | translate }}
        </a>

        <a
          *ngIf="!image.isWip"
          astrobinEventPreventDefault
          astrobinEventStopPropagation
          (click)="unpublish()"
          [class]="itemClass"
          >
          {{ "Move to staging area" | translate }}
        </a>
      </ng-container>

      <ng-container *ngIf="image.link || image.linkToFits">
        <div [class]="dividerClass"></div>

        <a
          *ngIf="image.link"
          [href]="image.link"
          [class]="itemClass"
        >
          {{ "External link" | translate }}
        </a>

        <a
          *ngIf="image.linkToFits"
          [href]="image.linkToFits"
          [class]="itemClass"
        >
          {{ "External link to FITS" | translate }}
        </a>
      </ng-container>
    </ng-container>
  `,
  styles: [
    `
      :host {
        display: flex;
        flex-direction: column;
        justify-content: center;
        align-items: center;
        height: 100%;
        overflow-y: auto;
        gap: 1px;
      }

      .standalone {
        padding: 1rem;
        width: calc(100% + 2rem);
        display: block;
        margin-left: -1rem;
        margin-right: -1rem;
        text-align: center;
        background: var(--grey);
      }

      .standalone-divider {
        height: .5rem;
        border: 0;
        background: none;
      }
    `
  ]
})
export class ImageViewerMenuComponent extends BaseComponentDirective {
  @Input() image: ImageInterface;
  @Input() itemClass: string;
  @Input() dividerClass: string;

  constructor(
    public readonly store$: Store<MainState>,
    public readonly actions$: Actions,
    public readonly classicRoutesService: ClassicRoutesService,
    public readonly popNotificationsService: PopNotificationsService
  ) {
    super(store$);
  }

  unpublish() {
    this.actions$.pipe(
      ofType(AppActionTypes.UNPUBLISH_IMAGE_SUCCESS),
      filter((action: UnpublishImageSuccess) => action.payload.pk === this.image.pk),
      take(1)
    ).subscribe(() => {
      this.popNotificationsService.success("Image moved to your staging area.");
    });

    this.store$.dispatch(new UnpublishImage({ pk: this.image.pk, }));
  }
}
