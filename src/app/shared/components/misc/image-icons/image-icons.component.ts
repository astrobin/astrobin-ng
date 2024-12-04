import { ChangeDetectionStrategy, Component, Input } from "@angular/core";
import { ImageInterface } from "@shared/interfaces/image.interface";
import { BaseComponentDirective } from "@shared/components/base-component.directive";

@Component({
  selector: 'astrobin-image-icons',
  template: `
    <fa-icon *ngIf="image.isPlayable" icon="play"></fa-icon>

    <fa-icon
      *ngIf="image.isWip"
      [ngbTooltip]="'This image is in your staging area' | translate"
      container="body"
      triggers="hover click"
      icon="lock"
      class="wip-icon"
    ></fa-icon>

    <div *ngIf="currentUserWrapper$ | async as currentUserWrapper" class="badges">
      <fa-icon
        *ngIf="image.isIotd"
        class="iotd"
        icon="trophy"
        [ngbTooltip]="'Image of the Day' | translate"
        container="body"
      ></fa-icon>

      <fa-icon
        *ngIf="!image.isIotd && image.isTopPick"
        class="top-pick"
        icon="star"
        [ngbTooltip]="'Top Pick' | translate"
        container="body"
      ></fa-icon>

      <fa-icon
        *ngIf="!image.isIotd && !image.isTopPick && image.isTopPickNomination"
        class="top-pick-nomination"
        icon="arrow-up"
        [ngbTooltip]="'Top Pick Nomination' | translate"
        container="body"
      ></fa-icon>

      <fa-icon
        *ngIf="
          currentUserWrapper.user?.id === image.user &&
          !image.isIotd &&
          !image.isTopPick &&
          !image.isTopPickNomination &&
          image.isInIotdQueue
        "
        class="in-iotd-queue"
        icon="gavel"
        [ngbTooltip]="'Currently in the IOTD/TP queues' | translate"
        container="body"
      ></fa-icon>

      <fa-icon
        *ngIf="image.collaborators?.length"
        class="collaborators"
        icon="users"
      ></fa-icon>
    </div>
  `,
  styleUrls: ['./image-icons.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ImageIconsComponent extends BaseComponentDirective {
  @Input() image: ImageInterface;
}
