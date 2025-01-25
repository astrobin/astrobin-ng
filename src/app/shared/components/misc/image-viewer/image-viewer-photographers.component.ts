import { ChangeDetectionStrategy, ChangeDetectorRef, Component, Input, OnChanges, Renderer2, SimpleChanges, TemplateRef, ViewChild } from "@angular/core";
import { ImageInterface, ImageRevisionInterface } from "@shared/interfaces/image.interface";
import { ClassicRoutesService } from "@shared/services/classic-routes.service";
import { ImageService } from "@shared/services/image/image.service";
import { ImageViewerSectionBaseComponent } from "@shared/components/misc/image-viewer/image-viewer-section-base.component";
import { select, Store } from "@ngrx/store";
import { MainState } from "@app/store/state";
import { SearchService } from "@features/search/services/search.service";
import { Router } from "@angular/router";
import { ImageViewerService } from "@shared/services/image-viewer.service";
import { UserInterface } from "@shared/interfaces/user.interface";
import { ContentTypeInterface } from "@shared/interfaces/content-type.interface";
import { NgbOffcanvas } from "@ng-bootstrap/ng-bootstrap";
import { DeviceService } from "@shared/services/device.service";
import { WindowRefService } from "@shared/services/window-ref.service";
import { filter, take } from "rxjs/operators";
import { LoadUser } from "@features/account/store/auth.actions";
import { selectUser } from "@features/account/store/auth.selectors";
import { forkJoin } from "rxjs";
import { TranslateService } from "@ngx-translate/core";
import { AcceptCollaboratorRequest, DenyCollaboratorRequest, ForceCheckTogglePropertyAutoLoad, RemoveCollaborator } from "@app/store/actions/image.actions";
import { LoadingService } from "@shared/services/loading.service";
import { UtilsService } from "@shared/services/utils/utils.service";
import { UserService } from "@shared/services/user.service";


@Component({
  selector: "astrobin-image-viewer-photographers",
  template: `
    <ng-container *ngIf="currentUserWrapper$ | async as currentUserWrapper">
      <ng-container *ngIf="isPendingCollaborator">
        <div
          class="alert alert-mini d-flex flex-nowrap align-items-center justify-content-between gap-2 mt-3 mb-2 px-3 py-2 w-100"
        >
          <span class="flex-grow-1">
            <fa-icon icon="info-circle" class="me-2"></fa-icon>
            <span translate="The owner of this image has requested to add you as a collaborator."></span>
          </span>

          <div class="d-flex flex-nowrap gap-2">
            <button
              (click)="acceptCollaboratorRequest(currentUserWrapper.user.id)"
              [ngbTooltip]="'Accept' | translate"
              class="btn btn-xs btn-success m-0"
              [class.loading]="loadingService.loading$ | async"
              container="body"
              triggers="hover"
            >
              <fa-icon icon="circle-check" class="me-0"></fa-icon>
            </button>

            <button
              (click)="denyCollaboratorRequest(currentUserWrapper.user.id)"
              [ngbTooltip]="'Deny' | translate"
              class="btn btn-xs btn-danger m-0"
              [class.loading]="loadingService.loading$ | async"
              container="body"
              triggers="hover"
            >
              <fa-icon icon="circle-xmark" class="me-0"></fa-icon>
            </button>
          </div>
        </div>
      </ng-container>

      <div class="metadata-section photographers mb-3">
        <div
          class="
            metadata-item
            flex-grow-1
            gap-3
          "
        >
          <ng-container *ngIf="photographers?.length > 0; else loadingTemplate">
            <div *ngIf="photographers.length > 1" class="avatars flex-grow-1">
              <a
                *ngFor="let user of photographers"
                (click)="avatarClicked($event, user)"
                [href]="userService.getGalleryUrl(user.username, currentUserWrapper.userProfile?.enableNewGalleryExperience)"
                class="position-relative"
              >
                <img [src]="user.avatar" alt="" class="avatar" />

                <fa-icon
                  *ngIf="user.pending"
                  [ngbTooltip]="'Pending confirmation' | translate"
                  class="position-absolute top-0 end-0 text-dark badge bg-light badge-pill rounded-pill border border-dark"
                  container="body"
                  icon="hourglass"
                  triggers="hover click"
                ></fa-icon>

                <button
                  *ngIf="user.canRemove"
                  (click)="removeCollaborator(user.id)"
                  astrobinEventPreventDefault
                  astrobinEventStopPropagation
                  [ngbTooltip]="'Remove' | translate"
                  container="body"
                  class="btn btn-link position-absolute top-0 end-0 text-light bg-danger badge badge-pill rounded-pill border border-light px-1"
                >
                  <fa-icon icon="times" class="me-0"></fa-icon>
                </button>
              </a>
            </div>

            <div
              *ngIf="photographers?.length === 1"
              class="
                d-flex
                align-items-center
                flex-nowrap
                flex-grow-1
                gap-3
                w-100
              "
            >
              <a
                (click)="userService.openGallery(photographers[0].username, currentUserWrapper.userProfile?.enableNewGalleryExperience)"
                [href]="userService.getGalleryUrl(photographers[0].username, currentUserWrapper.userProfile?.enableNewGalleryExperience)"
                astrobinEventPreventDefault
                class="position-relative"
              >
                <img [src]="photographers[0].avatar" alt="" class="avatar" />
              </a>

              <div class="d-flex gap-2 align-items-center">
                <a
                  (click)="userService.openGallery(photographers[0].username, currentUserWrapper.userProfile?.enableNewGalleryExperience)"
                  [href]="userService.getGalleryUrl(photographers[0].username, currentUserWrapper.userProfile?.enableNewGalleryExperience)"
                  astrobinEventPreventDefault
                >
                  {{ photographers[0].displayName }}
                </a>

                <astrobin-toggle-property
                  *ngIf="currentUserWrapper.user?.id !== image.user"
                  [contentType]="userContentType.id"
                  [objectId]="photographers[0].id"
                  [userId]="currentUserWrapper.user?.id"
                  [showLabel]="false"
                  [showIcon]="true"
                  [setLabel]="'Follow' | translate"
                  [unsetLabel]="'Unfollow' | translate"
                  class="btn-no-block follow-toggle-property"
                  btnClass="btn btn-xs btn-no-block btn-link link-secondary"
                  propertyType="follow"
                ></astrobin-toggle-property>
              </div>
            </div>
          </ng-container>

          <astrobin-image-viewer-social-buttons
            [image]="image"
            [showComments]="false"
            [showShare]="false"
            btnExtraClasses="btn-lg"
          ></astrobin-image-viewer-social-buttons>
        </div>
      </div>
    </ng-container>

    <ng-template #loadingTemplate>
      <div class="metadata-item flex-grow-1">
        <astrobin-loading-indicator></astrobin-loading-indicator>
      </div>
    </ng-template>

    <ng-template #collaboratorsTemplate let-offcanvas>
      <div class="offcanvas-header">
        <h4 class="offcanvas-title">{{ "Collaborators" | translate }}</h4>
        <button type="button" class="btn-close" aria-label="Close" (click)="offcanvas.dismiss()"></button>
      </div>
      <div class="offcanvas-body offcanvas-users">
        <div *ngIf="currentUserWrapper$ | async as currentUserWrapper" class="users">
          <div
            *ngFor="let user of photographers"
            class="user"
          >
            <a
              (click)="userService.openGallery(user.username, currentUserWrapper.userProfile?.enableNewGalleryExperience)"
              [href]="userService.getGalleryUrl(user.username, currentUserWrapper.userProfile?.enableNewGalleryExperience)"
              astrobinEventPreventDefault
            >
              <img [src]="user.avatar" alt="" />
            </a>

            <a
              (click)="userService.openGallery(user.username, currentUserWrapper.userProfile?.enableNewGalleryExperience)"
              [href]="userService.getGalleryUrl(user.username, currentUserWrapper.userProfile?.enableNewGalleryExperience)"
              astrobinEventPreventDefault
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
  styleUrls: ["./image-viewer-photographers.component.scss"],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ImageViewerPhotographersComponent extends ImageViewerSectionBaseComponent implements OnChanges {
  @Input()
  image: ImageInterface;

  @Input()
  revision: ImageInterface | ImageRevisionInterface;

  @Input()
  userContentType: ContentTypeInterface;

  @ViewChild("collaboratorsTemplate")
  collaboratorsTemplate: TemplateRef<any>;

  @ViewChild("shareTemplate")
  shareTemplate: TemplateRef<any>;

  protected photographers: (Partial<UserInterface> & { pending?: boolean, canRemove?: boolean })[];
  protected isPendingCollaborator: boolean;

  constructor(
    public readonly store$: Store<MainState>,
    public readonly searchService: SearchService,
    public readonly router: Router,
    public readonly imageViewerService: ImageViewerService,
    public readonly classicRoutesService: ClassicRoutesService,
    public readonly imageService: ImageService,
    public readonly offcanvasService: NgbOffcanvas,
    public readonly deviceService: DeviceService,
    public readonly windowRefService: WindowRefService,
    public readonly translateService: TranslateService,
    public readonly loadingService: LoadingService,
    public readonly renderer: Renderer2,
    public readonly utilsService: UtilsService,
    public readonly userService: UserService,
    public readonly changeDetectorRef: ChangeDetectorRef
  ) {
    super(store$, searchService, router, imageViewerService, windowRefService);
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes.image && changes.image.currentValue) {
      this.setPhotographers(this.image);
    }
  }

  setPhotographers(image: ImageInterface): void {
    this.currentUser$.pipe(take(1)).subscribe(currentUser => {
      this.photographers = [
        {
          id: image.user,
          avatar: UtilsService.convertDefaultAvatar(image.userAvatar),
          username: image.username,
          displayName: image.userDisplayName
        },
        ...image.collaborators.map(collaborator => ({
          id: collaborator.id,
          avatar: UtilsService.convertDefaultAvatar(collaborator.avatar),
          username: collaborator.username,
          displayName: collaborator.displayName,
          canRemove: currentUser && (collaborator.id === currentUser.id || currentUser.id === this.image.user)
        }))
      ];

      const pendingCollaborators = image.pendingCollaborators?.filter(
        pendingCollaborator =>
          !image.collaborators.some(collaborator => collaborator.id === pendingCollaborator)
      );

      this.isPendingCollaborator = !!currentUser && !!pendingCollaborators?.some(
        pendingCollaborator => pendingCollaborator === currentUser.id
      );

      if (
        currentUser &&
        pendingCollaborators?.length > 0 &&
        (
          currentUser.id === image.user ||
          this.isPendingCollaborator
        )
      ) {
        pendingCollaborators.forEach(pendingCollaborator => {
          this.store$.dispatch(new LoadUser({ id: pendingCollaborator }));
        });

        forkJoin(
          pendingCollaborators.map(pendingCollaborator => this.store$.pipe(
            select(selectUser, pendingCollaborator),
            filter(user => !!user),
            take(1)
          ))
        ).subscribe(pendingCollaborators => {
          this.photographers.push(
            ...pendingCollaborators.map(collaborator => ({
              id: collaborator.id,
              avatar: UtilsService.convertDefaultAvatar(collaborator.avatar),
              username: collaborator.username,
              displayName: collaborator.displayName,
              pending: true
            }))
          );
        });
      }

      this.changeDetectorRef.markForCheck();
    });
  }

  avatarClicked(event: MouseEvent, user: Partial<UserInterface>): void {
    if (this.photographers.length > 1) {
      event.preventDefault();
      this.openCollaboratorsOffcanvas();
    }
  }

  openCollaboratorsOffcanvas(): void {
    this.offcanvasService.open(this.collaboratorsTemplate, {
      panelClass: "image-viewer-offcanvas offcanvas-collaborators",
      backdropClass: "image-viewer-offcanvas-backdrop",
      position: this.deviceService.offcanvasPosition()
    });
    this.utilsService.delay(500).subscribe(() => {
      this.store$.dispatch(new ForceCheckTogglePropertyAutoLoad())
    });
  }

  acceptCollaboratorRequest(userId: UserInterface["id"]): void {
    this.store$.dispatch(new AcceptCollaboratorRequest({ pk: this.image.pk, userId }));
  }

  denyCollaboratorRequest(userId: UserInterface["id"]): void {
    this.store$.dispatch(new DenyCollaboratorRequest({ pk: this.image.pk, userId }));
  }

  removeCollaborator(userId: UserInterface["id"]): void {
    this.store$.dispatch(new RemoveCollaborator({ pk: this.image.pk, userId }));
  }
}
