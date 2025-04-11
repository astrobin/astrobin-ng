import { OnChanges, ChangeDetectionStrategy, Component, Input } from "@angular/core";
import { ImageSearchInterface } from "@core/interfaces/image-search.interface";
import { ImageInterface } from "@core/interfaces/image.interface";
import { BaseComponentDirective } from "@shared/components/base-component.directive";

@Component({
  selector: "astrobin-image-icons",
  template: `
    <fa-icon *ngIf="isPlayable" icon="play"></fa-icon>

    <fa-icon
      *ngIf="isWip"
      [ngbTooltip]="'This image is in your staging area' | translate"
      class="wip-icon"
      container="body"
      icon="lock"
      triggers="hover click"
    ></fa-icon>

    <div *ngIf="currentUserWrapper$ | async as currentUserWrapper" class="badges">
      <fa-icon
        *ngIf="image.isIotd"
        [ngbTooltip]="'Image of the Day' | translate"
        class="iotd"
        container="body"
        icon="trophy"
      ></fa-icon>

      <fa-icon
        *ngIf="!image.isIotd && image.isTopPick"
        [ngbTooltip]="'Top Pick' | translate"
        class="top-pick"
        container="body"
        icon="star"
      ></fa-icon>

      <fa-icon
        *ngIf="!image.isIotd && !image.isTopPick && image.isTopPickNomination"
        [ngbTooltip]="'Top Pick Nomination' | translate"
        class="top-pick-nomination"
        container="body"
        icon="arrow-up"
      ></fa-icon>

      <fa-icon
        *ngIf="
          currentUserWrapper.user?.id === image.user &&
          !image.isIotd &&
          !image.isTopPick &&
          !image.isTopPickNomination &&
          isInIotdQueue
        "
        [ngbTooltip]="'Currently in the IOTD/TP queues' | translate"
        class="in-iotd-queue"
        container="body"
        icon="gavel"
      ></fa-icon>

      <fa-icon *ngIf="isCollaboration" class="collaborators" icon="users"></fa-icon>
    </div>
  `,
  styleUrls: ["./image-icons.component.scss"],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ImageIconsComponent extends BaseComponentDirective implements OnChanges {
  @Input() image: ImageInterface | ImageSearchInterface;

  protected isCollaboration: boolean;
  protected isWip: boolean;
  protected isPlayable: boolean;
  protected isInIotdQueue: boolean;

  ngOnChanges() {
    this._setIsCollaboration();
    this._setIsWip();
    this._setIsPlayable();
    this._setIsInIotdQueue();
  }

  private _setIsCollaboration(): void {
    if (this.image.hasOwnProperty("collaborators")) {
      this.isCollaboration = (this.image as ImageInterface).collaborators?.length > 0;
    } else if (this.image.hasOwnProperty("collaboratorIds")) {
      this.isCollaboration = (this.image as ImageSearchInterface).collaboratorIds?.length > 0;
    }
  }

  private _setIsWip(): void {
    this.isWip = this.image.hasOwnProperty("isWip") && (this.image as ImageInterface).isWip;
  }

  private _setIsPlayable(): void {
    this.isPlayable = this.image.hasOwnProperty("isPlayable") && (this.image as ImageInterface).isPlayable;
  }

  private _setIsInIotdQueue(): void {
    this.isInIotdQueue = this.image.hasOwnProperty("isInIotdQueue") && (this.image as ImageInterface).isInIotdQueue;
  }
}
