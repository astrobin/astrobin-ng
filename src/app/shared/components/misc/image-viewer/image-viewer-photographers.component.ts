import type { OnChanges, SimpleChanges } from "@angular/core";
import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  Input,
  Renderer2,
  TemplateRef,
  ViewChild
} from "@angular/core";
import { Router } from "@angular/router";
import {
  AcceptCollaboratorRequest,
  DenyCollaboratorRequest,
  ForceCheckTogglePropertyAutoLoad,
  RemoveCollaborator
} from "@app/store/actions/image.actions";
import type { MainState } from "@app/store/state";
import { ContentTypeInterface } from "@core/interfaces/content-type.interface";
import type { ImageRevisionInterface } from "@core/interfaces/image.interface";
import { ImageInterface } from "@core/interfaces/image.interface";
import type { UserInterface } from "@core/interfaces/user.interface";
import { ClassicRoutesService } from "@core/services/classic-routes.service";
import { CollapseSyncService } from "@core/services/collapse-sync.service";
import { DeviceService } from "@core/services/device.service";
import { ImageService } from "@core/services/image/image.service";
import { ImageViewerService } from "@core/services/image-viewer.service";
import { LoadingService } from "@core/services/loading.service";
import { SearchService } from "@core/services/search.service";
import { UserService } from "@core/services/user.service";
import { UtilsService } from "@core/services/utils/utils.service";
import { WindowRefService } from "@core/services/window-ref.service";
import { LoadUser } from "@features/account/store/auth.actions";
import { selectUser } from "@features/account/store/auth.selectors";
import { NgbOffcanvas } from "@ng-bootstrap/ng-bootstrap";
import { select, Store } from "@ngrx/store";
import { TranslateService } from "@ngx-translate/core";
import { ImageViewerSectionBaseComponent } from "@shared/components/misc/image-viewer/image-viewer-section-base.component";
import { CookieService } from "ngx-cookie";
import { forkJoin } from "rxjs";
import { filter, take } from "rxjs/operators";

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

      <div class="metadata-section photographers mb-3 flex-wrap">
        <div
          class="
            metadata-item
            flex-grow-1
            justify-content-between
            gap-3
          "
        >
          <ng-container *ngIf="photographers?.length > 0; else loadingTemplate">
            <div *ngIf="photographers.length > 1" class="avatars flex-wrap flex-grow-1">
              <a
                *ngFor="let user of photographers"
                (click)="avatarClicked($event, user)"
                [href]="
                  userService.getGalleryUrl(
                    user.username,
                    !currentUserWrapper.userProfile || currentUserWrapper.userProfile.enableNewGalleryExperience
                  )
                "
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
                single-photographer-wrapper
              "
            >
              <a
                (click)="
                  userService.openGallery(
                    photographers[0].username,
                    !currentUserWrapper.userProfile || currentUserWrapper.userProfile.enableNewGalleryExperience
                  )
                "
                [href]="
                  userService.getGalleryUrl(
                    photographers[0].username,
                    !currentUserWrapper.userProfile || currentUserWrapper.userProfile.enableNewGalleryExperience
                  )
                "
                astrobinEventPreventDefault
                class="position-relative"
              >
                <img [src]="photographers[0].avatar" alt="" class="avatar" />
              </a>

              <div class="d-flex gap-2 align-items-center photographer-name-and-follow-button">
                <a
                  (click)="
                    userService.openGallery(
                      photographers[0].username,
                      !currentUserWrapper.userProfile || currentUserWrapper.userProfile.enableNewGalleryExperience
                    )
                  "
                  [href]="
                    userService.getGalleryUrl(
                      photographers[0].username,
                      !currentUserWrapper.userProfile || currentUserWrapper.userProfile.enableNewGalleryExperience
                    )
                  "
                  astrobinEventPreventDefault
                >
                  {{ photographers[0].displayName }}
                </a>

                <div
                  *ngIf="currentUserWrapper.user?.id !== image.user"
                  ngbDropdown
                  container="body"
                  class="no-toggle m-0"
                >
                  <button
                    class="btn btn-sm btn-link btn-no-block no-toggle text-secondary px-2 m-0"
                    ngbDropdownToggle
                    id="photographer-actions-dropdown"
                  >
                    <fa-icon [icon]="['fas', 'ellipsis-v']" class="m-0"></fa-icon>
                  </button>
                  <div ngbDropdownMenu aria-labelledby="photographer-actions-dropdown">
                    <a
                      [href]="classicRoutesService.SEND_MESSAGE(image.username)"
                      class="dropdown-item"
                      translate="Send private message"
                    ></a>
                  </div>
                </div>

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
      <div class="offcanvas-body">
        <div *ngIf="currentUserWrapper$ | async as currentUserWrapper" class="users">
          <div *ngFor="let user of photographers" class="user">
            <a
              (click)="
                userService.openGallery(
                  user.username,
                  !currentUserWrapper.userProfile || currentUserWrapper.userProfile.enableNewGalleryExperience
                )
              "
              [href]="
                userService.getGalleryUrl(
                  user.username,
                  !currentUserWrapper.userProfile || currentUserWrapper.userProfile.enableNewGalleryExperience
                )
              "
              astrobinEventPreventDefault
            >
              <img [src]="user.avatar" alt="" />
            </a>

            <a
              (click)="
                userService.openGallery(
                  user.username,
                  !currentUserWrapper.userProfile || currentUserWrapper.userProfile.enableNewGalleryExperience
                )
              "
              [href]="
                userService.getGalleryUrl(
                  user.username,
                  !currentUserWrapper.userProfile || currentUserWrapper.userProfile.enableNewGalleryExperience
                )
              "
              astrobinEventPreventDefault
              class="d-block flex-grow-1 text-start"
            >
              {{ user.displayName }}
            </a>

            <div *ngIf="currentUserWrapper.user?.id !== image.user" ngbDropdown container="body" class="no-toggle me-2">
              <button
                class="btn btn-sm btn-link btn-no-block no-toggle text-secondary px-2 m-0"
                ngbDropdownToggle
                id="photographer-actions-dropdown"
              >
                <fa-icon [icon]="['fas', 'ellipsis-v']" class="m-0"></fa-icon>
              </button>
              <div ngbDropdownMenu aria-labelledby="photographer-actions-dropdown">
                <a
                  [href]="classicRoutesService.SEND_MESSAGE(image.username)"
                  class="dropdown-item"
                  translate="Send private message"
                ></a>
              </div>
            </div>

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

  protected photographers: (Partial<UserInterface> & { pending?: boolean; canRemove?: boolean })[];
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
    public readonly changeDetectorRef: ChangeDetectorRef,
    public readonly cookieService: CookieService,
    public readonly collapseSyncService: CollapseSyncService
  ) {
    super(
      store$,
      searchService,
      router,
      imageViewerService,
      windowRefService,
      cookieService,
      collapseSyncService,
      changeDetectorRef
    );
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
        pendingCollaborator => !image.collaborators.some(collaborator => collaborator.id === pendingCollaborator)
      );

      this.isPendingCollaborator =
        !!currentUser && !!pendingCollaborators?.some(pendingCollaborator => pendingCollaborator === currentUser.id);

      if (
        currentUser &&
        pendingCollaborators?.length > 0 &&
        (currentUser.id === image.user || this.isPendingCollaborator)
      ) {
        pendingCollaborators.forEach(pendingCollaborator => {
          this.store$.dispatch(new LoadUser({ id: pendingCollaborator }));
        });

        forkJoin(
          pendingCollaborators.map(pendingCollaborator =>
            this.store$.pipe(
              select(selectUser, pendingCollaborator),
              filter(user => !!user),
              take(1)
            )
          )
        ).subscribe(fetchedPendingCollaborators => {
          this.photographers.push(
            ...fetchedPendingCollaborators.map(collaborator => ({
              id: collaborator.id,
              avatar: UtilsService.convertDefaultAvatar(collaborator.avatar),
              username: collaborator.username,
              displayName: collaborator.displayName,
              pending: true
            }))
          );
          this.changeDetectorRef.markForCheck();
        });
      }

      this.changeDetectorRef.markForCheck();
    });
  }

  avatarClicked(event: MouseEvent): void {
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
      this.store$.dispatch(new ForceCheckTogglePropertyAutoLoad());
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
