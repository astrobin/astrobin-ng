import { Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges } from "@angular/core";
import { FINAL_REVISION_LABEL, ImageInterface, ImageRevisionInterface } from "@shared/interfaces/image.interface";
import { BaseComponentDirective } from "@shared/components/base-component.directive";
import { MainState } from "@app/store/state";
import { Store } from "@ngrx/store";
import { ImageAlias } from "@shared/enums/image-alias.enum";

@Component({
  selector: "astrobin-image-viewer-revisions",
  template: `
    <div *ngIf="revisionData && revisionData.length > 1" class="revisions">
      <div
        *ngFor="let revision of revisionData"
        (click)="onRevisionSelected(revision.label)"
        [class.active]="revision.active"
        class="revision"
      >
        <img [src]="revision.gallery" alt="" />
      </div>
    </div>
  `,
  styleUrls: ["./image-viewer-revisions.component.scss"]
})
export class ImageViewerRevisionsComponent extends BaseComponentDirective implements OnInit, OnChanges {
  @Input()
  image: ImageInterface;

  @Output()
  revisionSelected = new EventEmitter<ImageRevisionInterface["label"]>();

  revisionData: {
    active: boolean;
    id: ImageRevisionInterface["pk"];
    label: ImageRevisionInterface["label"];
    gallery: string;
    regular: string;
    hd: string;
    qhd: string;
  }[];

  constructor(
    public readonly store$: Store<MainState>
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
    this.revisionData = [
      {
        id: image.pk,
        active: true,
        label: FINAL_REVISION_LABEL,
        gallery: image.thumbnails.find(thumbnail => thumbnail.alias === ImageAlias.GALLERY).url,
        regular: image.thumbnails.find(thumbnail => thumbnail.alias === ImageAlias.REGULAR).url,
        hd: image.thumbnails.find(thumbnail => thumbnail.alias === ImageAlias.HD).url,
        qhd: image.thumbnails.find(thumbnail => thumbnail.alias === ImageAlias.QHD).url
      },
      ...image.revisions.map(revision => ({
        id: revision.pk,
        active: false,
        label: revision.label,
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
}
