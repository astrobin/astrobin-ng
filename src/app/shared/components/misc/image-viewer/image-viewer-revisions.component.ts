import { Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges } from "@angular/core";
import { FINAL_REVISION_LABEL, ImageInterface, ImageRevisionInterface, ORIGINAL_REVISION_LABEL } from "@shared/interfaces/image.interface";
import { BaseComponentDirective } from "@shared/components/base-component.directive";
import { MainState } from "@app/store/state";
import { Store } from "@ngrx/store";
import { ImageAlias } from "@shared/enums/image-alias.enum";
import { ImageService } from "@shared/services/image/image.service";

@Component({
  selector: "astrobin-image-viewer-revisions",
  template: `
    <div *ngIf="revisionData && revisionData.length > 1" class="revisions">
      <div
        *ngFor="let revision of revisionData"
        (click)="onRevisionSelected(revision.label)"
        [class.active]="revision.active"
        [class.final]="revision.isFinal"
        class="revision"
      >
        <img [src]="revision.gallery" alt="" />
        <span
          *ngIf="revision.label !== FINAL_REVISION_LABEL && revision.label !== ORIGINAL_REVISION_LABEL"
          class="label"
        >{{ revision.label }}
        </span>
      </div>

      <ng-container *ngIf="currentUserWrapper$ | async as currentUserWrapper">
        <div *ngIf="currentUserWrapper.user?.id === image.user" class="revision">
          <a [routerLink]="['/uploader/revision', image.hash || image.pk.toString()]" class="add-revision">
            <fa-icon icon="plus"></fa-icon>
          </a>
        </div>
      </ng-container>
    </div>
  `,
  styleUrls: ["./image-viewer-revisions.component.scss"]
})
export class ImageViewerRevisionsComponent extends BaseComponentDirective implements OnInit, OnChanges {
  @Input()
  image: ImageInterface;

  @Input()
  activeLabel: ImageRevisionInterface["label"];

  @Output()
  revisionSelected = new EventEmitter<ImageRevisionInterface["label"]>();

  revisionData: {
    active: boolean;
    id: ImageRevisionInterface["pk"];
    label: ImageRevisionInterface["label"];
    isFinal: boolean;
    gallery: string;
    regular: string;
    hd: string;
    qhd: string;
  }[];

  constructor(
    public readonly store$: Store<MainState>,
    public readonly imageService: ImageService
  ) {
    super(store$);
  }

  ngOnInit(): void {
    super.ngOnInit();
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes.image && changes.image.currentValue) {
      this.setRevisionData(changes.image.currentValue);
    }
  }

  setRevisionData(image: ImageInterface): void {
    if (this.activeLabel === FINAL_REVISION_LABEL) {
      this.activeLabel = this.imageService.getFinalRevisionLabel(image);
    }

    this.revisionData = [
      {
        id: image.pk,
        active: this.activeLabel === ORIGINAL_REVISION_LABEL,
        label: ORIGINAL_REVISION_LABEL,
        isFinal: image.isFinal,
        gallery: image.thumbnails.find(thumbnail =>
          thumbnail.revision == (image.isFinal ? FINAL_REVISION_LABEL : ORIGINAL_REVISION_LABEL) &&
          thumbnail.alias === ImageAlias.GALLERY).url,
        regular: image.thumbnails.find(thumbnail =>
          thumbnail.revision == (image.isFinal ? FINAL_REVISION_LABEL : ORIGINAL_REVISION_LABEL) &&
          thumbnail.alias === ImageAlias.REGULAR).url,
        hd: image.thumbnails.find(thumbnail =>
          thumbnail.revision == (image.isFinal ? FINAL_REVISION_LABEL : ORIGINAL_REVISION_LABEL) &&
          thumbnail.alias === ImageAlias.HD).url,
        qhd: image.thumbnails.find(thumbnail =>
          thumbnail.revision == (image.isFinal ? FINAL_REVISION_LABEL : ORIGINAL_REVISION_LABEL) &&
          thumbnail.alias === ImageAlias.QHD).url
      },
      ...image.revisions.map(revision => ({
        id: revision.pk,
        active: this.activeLabel === revision.label,
        label: revision.label,
        isFinal: revision.isFinal,
        gallery: revision.thumbnails.find(thumbnail => thumbnail.alias === ImageAlias.GALLERY).url,
        regular: revision.thumbnails.find(thumbnail => thumbnail.alias === ImageAlias.REGULAR).url,
        hd: revision.thumbnails.find(thumbnail => thumbnail.alias === ImageAlias.HD).url,
        qhd: revision.thumbnails.find(thumbnail => thumbnail.alias === ImageAlias.QHD).url
      }))
    ];
  }

  onRevisionSelected(revisionLabel: ImageRevisionInterface["label"]): void {
    this.revisionData = this.revisionData.map(revision => ({
      ...revision,
      active: revision.label === revisionLabel
    }));
    this.revisionSelected.emit(revisionLabel);
  }

  protected readonly FINAL_REVISION_LABEL = FINAL_REVISION_LABEL;
  protected readonly ORIGINAL_REVISION_LABEL = ORIGINAL_REVISION_LABEL;
}
