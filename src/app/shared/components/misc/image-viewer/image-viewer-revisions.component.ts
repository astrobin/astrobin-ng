import { Component, EventEmitter, Input, OnChanges, Output, SimpleChanges } from "@angular/core";
import { FINAL_REVISION_LABEL, ImageInterface, ImageRevisionInterface, ORIGINAL_REVISION_LABEL } from "@core/interfaces/image.interface";
import { BaseComponentDirective } from "@shared/components/base-component.directive";
import { MainState } from "@app/store/state";
import { Store } from "@ngrx/store";
import { ImageAlias } from "@core/enums/image-alias.enum";
import { ImageService } from "@core/services/image/image.service";
import { DeleteImageRevision, DeleteOriginalImage, MarkImageAsFinal } from "@app/store/actions/image.actions";
import { NgbModal, NgbModalRef } from "@ng-bootstrap/ng-bootstrap";
import { ConfirmationDialogComponent } from "@shared/components/misc/confirmation-dialog/confirmation-dialog.component";
import { TranslateService } from "@ngx-translate/core";
import { ImageThumbnailInterface } from "@core/interfaces/image-thumbnail.interface";

interface RevisionDataInterface {
  active: boolean;
  id: ImageRevisionInterface["pk"];
  label: ImageRevisionInterface["label"];
  title: string;
  description: string;
  published: string;
  isFinal: boolean;
  original: string;
  gallery: ImageThumbnailInterface;
  deleting?: boolean;
}

@Component({
  selector: "astrobin-image-viewer-revisions",
  template: `
    <ng-container *ngIf="currentUserWrapper$ | async as currentUserWrapper">
      <div *ngIf="revisionData && revisionData.length > 1" class="revisions">
        <div
          *ngFor="let revision of revisionData"
          (click)="!revision.deleting && onRevisionSelected(revision.label)"
          [class.active]="revision.active"
          [class.final]="revision.isFinal"
          [class.deleting]="revision.deleting"
          class="revision"
        >
          <img
            [src]="revision.gallery?.url"
            alt=""
          />
          <span
            *ngIf="revision.label !== FINAL_REVISION_LABEL && revision.label !== ORIGINAL_REVISION_LABEL"
            class="label"
          >
            {{ revision.label }}
          </span>

          <div
            *ngIf="currentUserWrapper.user?.id === image.user && !revision.deleting"
            class="no-toggle z-index-1"
            ngbDropdown
            container="body"
          >
            <fa-icon
              astrobinEventStopPropagation
              ngbDropdownToggle
              icon="ellipsis"
              class="dropdown-toggle no-toggle"
              aria-haspopup="true"
              aria-expanded="false"
            ></fa-icon>
            <div ngbDropdownMenu class="dropdown-menu">
              <a
                *ngIf="revision.label !== ORIGINAL_REVISION_LABEL"
                ngbDropdownItem
                [routerLink]="['/i', image.hash || image.pk.toString(), revision.label, 'edit']"
              >
                {{ "Edit" | translate }}
              </a>

              <a
                *ngIf="!revision.isFinal"
                (click)="markAsFinal(revision)"
                ngbDropdownItem
                astrobinEventPreventDefault
                astrobinEventStopPropagation
                href="#"
              >
                {{ "Mark as final" | translate }}
              </a>

              <a
                *ngIf="revision.original"
                [href]="revision.original"
                ngbDropdownItem
                target="_blank"
              >
                {{ "Download original" | translate }}
              </a>

              <a
                *ngIf="revision.label === ORIGINAL_REVISION_LABEL"
                (click)="showDeleteOriginalConfirmation()"
                astrobinEventPreventDefault
                class="text-danger"
                ngbDropdownItem
                href="#"
              >
                {{ "Delete" | translate }}
              </a>

              <a
                *ngIf="revision.label !== ORIGINAL_REVISION_LABEL && revision.label !== FINAL_REVISION_LABEL"
                (click)="showDeleteRevisionConfirmation(revision.id)"
                astrobinEventPreventDefault
                class="text-danger"
                ngbDropdownItem
                href="#"
              >
                {{ "Delete" | translate }}
              </a>
            </div>
          </div>
          
          <div *ngIf="revision.deleting" class="loading-overlay">
            <div class="spinner-border spinner-border-sm text-light" role="status">
              <span class="sr-only">Loading...</span>
            </div>
          </div>
        </div>

        <div *ngIf="currentUserWrapper.user?.id === image.user" class="revision">
          <a [routerLink]="['/uploader/revision', image.hash || image.pk.toString()]" class="add-revision">
            <fa-icon icon="plus"></fa-icon>
          </a>
        </div>
      </div>
    </ng-container>
  `,
  styleUrls: ["./image-viewer-revisions.component.scss"]
})
export class ImageViewerRevisionsComponent extends BaseComponentDirective implements OnChanges {
  @Input()
  image: ImageInterface;

  @Input()
  activeLabel: ImageRevisionInterface["label"];

  @Output()
  revisionSelected = new EventEmitter<ImageRevisionInterface["label"]>();

  revisionData: RevisionDataInterface[];
  protected readonly FINAL_REVISION_LABEL = FINAL_REVISION_LABEL;
  protected readonly ORIGINAL_REVISION_LABEL = ORIGINAL_REVISION_LABEL;

  constructor(
    public readonly store$: Store<MainState>,
    public readonly imageService: ImageService,
    public readonly modalService: NgbModal,
    public readonly translateService: TranslateService
  ) {
    super(store$);
  }

  ngOnChanges(changes: SimpleChanges) {
    this.setRevisionData(this.image);
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
        title: image.title,
        description: null,
        published: image.published || image.uploaded,
        isFinal: image.isFinal,
        original: image.videoFile || image.imageFile,
        gallery: image.thumbnails ? image.thumbnails.find(thumbnail =>
          thumbnail.revision == (image.isFinal ? FINAL_REVISION_LABEL : ORIGINAL_REVISION_LABEL) &&
          thumbnail.alias === ImageAlias.GALLERY
        ) : {
          id: null,
          revision: image.isFinal ? FINAL_REVISION_LABEL : ORIGINAL_REVISION_LABEL,
          alias: ImageAlias.GALLERY,
          url: image.finalGalleryThumbnail || null
        }
      },
      ...image.revisions.map(revision => ({
        id: revision.pk,
        active: this.activeLabel === revision.label,
        label: revision.label,
        title: revision.title,
        description: revision.description,
        published: revision.uploaded,
        isFinal: revision.isFinal,
        original: revision.videoFile || revision.imageFile,
        gallery: revision.thumbnails.find(thumbnail => thumbnail.alias === ImageAlias.GALLERY)
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

  markAsFinal(revision: any): void {
    const label = revision.hasOwnProperty("label")
      ? (revision as ImageRevisionInterface).label
      : FINAL_REVISION_LABEL;

    this.store$.dispatch(new MarkImageAsFinal({ pk: this.image.pk, revisionLabel: label }));
  }

  showDeleteOriginalConfirmation(): void {
    const modalRef: NgbModalRef = this.modalService.open(ConfirmationDialogComponent);
    const instance: ConfirmationDialogComponent = modalRef.componentInstance;
    instance.message = this.translateService.instant(
      "This will delete the original image, and the first revision will take its place. All metadata will remain" +
      " intact."
    );

    modalRef.closed.subscribe(() => {
      this.deleteOriginal();
    });
  }

  deleteOriginal(): void {
    // Find the original revision and mark it as deleting
    const originalRevision = this.revisionData.find(revision => revision.label === ORIGINAL_REVISION_LABEL);
    if (originalRevision) {
      originalRevision.deleting = true;
    }
    
    this.store$.dispatch(new DeleteOriginalImage({ pk: this.image.pk }));
  }

  showDeleteRevisionConfirmation(pk: ImageRevisionInterface["pk"]): void {
    const modalRef: NgbModalRef = this.modalService.open(ConfirmationDialogComponent);
    const instance: ConfirmationDialogComponent = modalRef.componentInstance;
    instance.message = this.translateService.instant("This will delete this revision. Your original image and all" +
      " metadata will remain intact. This operation cannot be undone.");

    modalRef.closed.subscribe(() => {
      this.deleteRevision(pk);
    });
  }

  deleteRevision(pk: ImageRevisionInterface["pk"]): void {
    // Find the revision and mark it as deleting
    const revisionToDelete = this.revisionData.find(revision => revision.id === pk);
    if (revisionToDelete) {
      revisionToDelete.deleting = true;
    }
    
    this.store$.dispatch(new DeleteImageRevision({ pk }));
  }
}
