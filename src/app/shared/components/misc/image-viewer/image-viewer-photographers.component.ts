import { Component, Input, OnChanges, SimpleChanges, TemplateRef, ViewChild } from "@angular/core";
import { ImageInterface } from "@shared/interfaces/image.interface";
import { ClassicRoutesService } from "@shared/services/classic-routes.service";
import { ImageService } from "@shared/services/image/image.service";
import { ImageViewerSectionBaseComponent } from "@shared/components/misc/image-viewer/image-viewer-section-base.component";
import { Store } from "@ngrx/store";
import { MainState } from "@app/store/state";
import { SearchService } from "@features/search/services/search.service";
import { Router } from "@angular/router";
import { ImageViewerService } from "@shared/services/image-viewer.service";
import { UserInterface } from "@shared/interfaces/user.interface";
import { ContentTypeInterface } from "@shared/interfaces/content-type.interface";
import { NgbOffcanvas } from "@ng-bootstrap/ng-bootstrap";
import { DeviceService } from "@shared/services/device.service";
import { IconProp } from "@fortawesome/fontawesome-svg-core";

@Component({
  selector: "astrobin-image-viewer-photographers",
  template: `
    <div class="metadata-section">
      <div class="metadata-item avatars">
        <a
          *ngFor="let user of users"
          (click)="avatarClicked($event, user)"
          [href]="classicRoutesService.GALLERY(user.username)"
        >
          <img [src]="user.avatar" alt="" />
        </a>
      </div>

      <div *ngIf="users?.length === 1" class="metadata-item flex-grow-1 text-start no-wrap">
        <a
          *ngFor="let user of users"
          [href]="classicRoutesService.GALLERY(user.username)"
          class="d-block"
        >
          {{ user.displayName }}
        </a>

        <ng-container *ngIf="currentUserWrapper$ | async as currentUserWrapper">
          <astrobin-toggle-property
            *ngIf="currentUserWrapper.user?.id !== image.user"
            [contentType]="userContentType.id"
            [objectId]="image.user"
            [userId]="currentUserWrapper.user?.id"
            [showLabel]="false"
            [setLabel]="'Follow user' | translate"
            [unsetLabel]="'Unfollow user' | translate"
            class="w-auto"
            btnClass="btn btn-link btn-no-block link-secondary"
            propertyType="follow"
          ></astrobin-toggle-property>
        </ng-container>
      </div>

      <div *ngIf="publicationDate" class="metadata-item flex-column gap-0 align-items-end">
        <div class="publication-date d-flex flex-row gap-2">
          <ng-container *ngIf="licenseIcon && licenseTooltip">
            <fa-icon [icon]="licenseIcon" [ngbTooltip]="licenseTooltip"></fa-icon>
          </ng-container>
          {{ publicationDate | localDate | timeago:true }}
        </div>
        <div class="view-count">
          <span *ngIf="image.viewCount === 1" [translate]="'One view'"></span>
          <span
            *ngIf="image.viewCount > 1"
            [translateParams]="{
            '0': image.viewCount
          }"
            [translate]="'{{0}} views'"
          ></span>
        </div>
      </div>
    </div>

    <ng-template #collaboratorsTemplate let-offcanvas>
      <div class="offcanvas-header">
        <h4 class="offcanvas-title">{{ "Collaborators" | translate }}</h4>
        <button type="button" class="btn-close" aria-label="Close" (click)="offcanvas.dismiss()"></button>
      </div>
      <div class="offcanvas-body offcanvas-users">
        <div class="users">
          <div
            *ngFor="let user of users"
            class="user"
          >
            <a [href]="classicRoutesService.GALLERY(user.username)">
              <img [src]="user.avatar" alt="" />
            </a>

            <a
              [href]="classicRoutesService.GALLERY(user.username)"
              class="d-block flex-grow-1 text-start no-wrap"
            >
              {{ user.displayName }}
            </a>

            <ng-container *ngIf="currentUserWrapper$ | async as currentUserWrapper">
              <astrobin-toggle-property
                *ngIf="currentUserWrapper.user?.id !== user.id"
                [contentType]="userContentType.id"
                [objectId]="user.id"
                [userId]="currentUserWrapper.user?.id"
                [showLabel]="false"
                [setLabel]="'Follow user' | translate"
                [unsetLabel]="'Unfollow user' | translate"
                class="w-auto"
                btnClass="btn btn-link btn-no-block link-secondary"
                propertyType="follow"
              ></astrobin-toggle-property>
            </ng-container>
          </div>
        </div>
      </div>
    </ng-template>
  `,
  styleUrls: ["./image-viewer-photographers.component.scss"]
})
export class ImageViewerPhotographersComponent extends ImageViewerSectionBaseComponent implements OnChanges {
  @Input()
  image: ImageInterface;

  @Input()
  userContentType: ContentTypeInterface;

  @ViewChild("collaboratorsTemplate")
  collaboratorsTemplate: TemplateRef<any>;

  users: Partial<UserInterface>[];

  publicationDate: string;
  licenseIcon: IconProp;
  licenseTooltip: string;

  constructor(
    public readonly store$: Store<MainState>,
    public readonly searchService: SearchService,
    public readonly router: Router,
    public readonly imageViewerService: ImageViewerService,
    public readonly classicRoutesService: ClassicRoutesService,
    public readonly imageService: ImageService,
    public readonly offcanvasService: NgbOffcanvas,
    public readonly deviceService: DeviceService
  ) {
    super(store$, searchService, router, imageViewerService);
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes.image && changes.image.currentValue) {
      this.setUsers(changes.image.currentValue);
      this.setPublicationDate(changes.image.currentValue);
      this.setLicenseIconAndTooltip(changes.image.currentValue);
    }
  }

  setUsers(image: ImageInterface): void {
    const appAvatar = (avatar: string): string => {
      if (avatar.indexOf("default-avatar") > -1) {
        return "/assets/images/default-avatar.jpeg?v=2";
      }

      return avatar;
    }
    this.users = [
      {
        id: image.user,
        avatar: appAvatar(image.userAvatar),
        username: image.username,
        displayName: image.userDisplayName
      },
      ...image.collaborators.map(collaborator => ({
        id: collaborator.id,
        avatar: appAvatar(collaborator.avatar),
        username: collaborator.username,
        displayName: collaborator.displayName
      }))
    ];
  }

  setPublicationDate(image: ImageInterface): void {
    this.publicationDate = this.imageService.getPublicationDate(image);
  }
  setLicenseIconAndTooltip(image: ImageInterface): void {
    this.licenseIcon = this.imageService.getLicenseIcon(image.license);
    this.licenseTooltip = this.imageService.humanizeLicenseOption(image.license);
  }

  avatarClicked(event: MouseEvent, user: Partial<UserInterface>): void {
    if (this.users.length > 1) {
      event.preventDefault();
      this.openCollaboratorsOffcanvas();
    }
  }

  openCollaboratorsOffcanvas(): void {
    const position = this.deviceService.smMax() ? "bottom" : "end";
    this.offcanvasService.open(this.collaboratorsTemplate, {
      panelClass: "offcanvas-collaborators",
      position
    });
  }
}
