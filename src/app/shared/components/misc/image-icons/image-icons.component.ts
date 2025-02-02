import { ChangeDetectionStrategy, Component, Input, OnChanges } from "@angular/core";
import { ImageInterface } from "@core/interfaces/image.interface";
import { BaseComponentDirective } from "@shared/components/base-component.directive";
import { ImageSearchInterface } from "@core/interfaces/image-search.interface";

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
        *ngIf="isCollaboration"
        class="collaborators"
        icon="users"
      ></fa-icon>
    </div>
  `,
  styleUrls: ['./image-icons.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ImageIconsComponent extends BaseComponentDirective implements OnChanges {
  @Input() image: ImageInterface | ImageSearchInterface;

  protected isCollaboration: boolean;

  ngOnChanges() {
    if (this.image.hasOwnProperty('collaborators')) {
      this.isCollaboration = (this.image as ImageInterface).collaborators?.length > 0;
    } else if (this.image.hasOwnProperty('collaboratorIds')) {
      this.isCollaboration = (this.image as ImageSearchInterface).collaboratorIds?.length > 0;
    }
  }
}
