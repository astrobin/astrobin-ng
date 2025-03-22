import { ChangeDetectionStrategy, ChangeDetectorRef, Component, Input, OnChanges, SimpleChanges } from "@angular/core";
import { BaseComponentDirective } from "@shared/components/base-component.directive";
import { select, Store } from "@ngrx/store";
import { MainState } from "@app/store/state";
import { UserInterface } from "@core/interfaces/user.interface";
import { ClassicRoutesService } from "@core/services/classic-routes.service";
import { LoadUser } from "@features/account/store/auth.actions";
import { selectUser } from "@features/account/store/auth.selectors";
import { filter, switchMap, take, tap } from "rxjs/operators";
import { UserSubscriptionService } from "@core/services/user-subscription/user-subscription.service";
import { Router } from "@angular/router";
import { WindowRefService } from "@core/services/window-ref.service";
import { UserService } from "@core/services/user.service";
import { LoadToggleProperty } from "@app/store/actions/toggle-property.actions";
import { TogglePropertyInterface } from "@core/interfaces/toggle-property.interface";
import { LoadContentType } from "@app/store/actions/content-type.actions";
import { selectContentType } from "@app/store/selectors/app/content-type.selectors";
import { ContentTypeInterface } from "@core/interfaces/content-type.interface";
import { selectToggleProperty } from "@app/store/selectors/app/toggle-property.selectors";
import { fadeInOut } from "@shared/animations";
import { CommonApiService } from "@core/services/api/classic/common/common-api.service";
import { NgbOffcanvas } from "@ng-bootstrap/ng-bootstrap";
import { AvatarEditorComponent } from "@shared/components/misc/avatar-editor/avatar-editor.component";

@Component({
  selector: "astrobin-avatar",
  templateUrl: "./avatar.component.html",
  styleUrls: ["./avatar.component.scss"],
  animations: [fadeInOut],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AvatarComponent extends BaseComponentDirective implements OnChanges {
  @Input()
  user: UserInterface;

  @Input()
  userId: UserInterface["id"];

  @Input()
  link = true;

  @Input()
  showPremiumBadge = false;

  @Input()
  showFollowsYouBadge = false;

  @Input()
  showEditButton = false;

  protected avatarUrl: string = "/assets/images/default-avatar.jpeg?v=2";
  protected url: string;
  protected followsYou = false;
  protected isCurrentUser = false;

  constructor(
    public readonly store$: Store<MainState>,
    public readonly classicRoutesService: ClassicRoutesService,
    public readonly userSubscriptionService: UserSubscriptionService,
    public readonly router: Router,
    public readonly windowRefService: WindowRefService,
    public readonly userService: UserService,
    public readonly changeDetectorRef: ChangeDetectorRef,
    private readonly offcanvasService: NgbOffcanvas
  ) {
    super(store$);
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes.user || changes.userId) {
      this.followsYou = false;

      if (this.userId && !this.user) {
        this.store$.select(selectUser, this.userId).pipe(
          filter(user => !!user),
          take(1)
        ).subscribe(user => {
          this.user = user;
          this._setAvatar();
          this._setUrl();
          this._setFollowsYou();
          this._checkIsCurrentUser();
          this.changeDetectorRef.markForCheck();
        });

        this.store$.dispatch(new LoadUser({ id: this.userId }));
      } else if (this.user) {
        this._setAvatar();
        this._setUrl();
        this._setFollowsYou();
        this._checkIsCurrentUser();
      }
    }
  }

  protected openGallery(): void {
    this.currentUserProfile$.pipe(take(1)).subscribe(currentUserProfile => {
      this.userService.openGallery(
        this.user.username,
        !currentUserProfile || currentUserProfile.enableNewGalleryExperience
      );
    });
  }
  
  protected openAvatarEditor(event: MouseEvent): void {
    event.preventDefault();
    event.stopPropagation();
    
    // Open the offcanvas with the AvatarEditorComponent
    const offcanvasRef = this.offcanvasService.open(AvatarEditorComponent, {
      position: 'end',
      panelClass: 'avatar-editor-offcanvas',
      backdropClass: 'avatar-editor-backdrop',
      backdrop: 'static', // Prevent closing by clicking outside
      beforeDismiss: () => offcanvasRef.componentInstance.beforeDismiss()
    });
    
    // Pass the user to the component
    offcanvasRef.componentInstance.user = this.user;
    
    // When the avatar is updated, update this component as well
    offcanvasRef.componentInstance.avatarUpdated.subscribe((newAvatarUrl: string) => {
      this.avatarUrl = newAvatarUrl;
      this.changeDetectorRef.markForCheck();
    });
  }

  private _setAvatar(): void {
    if (
      this.user.hasOwnProperty("largeAvatar") &&
      typeof this.user.largeAvatar === "string"
      && this.user.largeAvatar.indexOf("default-avatar") > -1
    ) {
      this.avatarUrl = "/assets/images/default-avatar.jpeg?v=2";
    } else {
      this.avatarUrl = this.user.largeAvatar;
    }
  }

  private _setUrl(): void {
    this.currentUserProfile$.pipe(take(1)).subscribe(currentUserProfile => {
      return this.userService.getGalleryUrl(
        this.user.username,
        !currentUserProfile || currentUserProfile.enableNewGalleryExperience
      );
    });
  }

  private _setFollowsYou(): void {
    this.currentUser$.pipe(take(1)).subscribe(currentUser => {
      if (!currentUser || currentUser.id === this.user?.id || currentUser.id === this.userId) {
        return;
      }

      this.store$.pipe(
        select(selectContentType, {
          appLabel: "auth",
          model: "user"
        }),
        filter(contentType => !!contentType),
        take(1),
        tap((contentType: ContentTypeInterface) => {
          this.store$.dispatch(new LoadToggleProperty({
            toggleProperty: {
              propertyType: "follow",
              user: this.user ? this.user.id : this.userId,
              contentType: contentType.id,
              objectId: currentUser.id
            }
          }));
        }),
        switchMap((contentType: ContentTypeInterface) => this.store$.pipe(
          select(selectToggleProperty({
            propertyType: "follow",
            user: this.user ? this.user.id : this.userId,
            contentType: contentType.id,
            objectId: currentUser.id
          })),
          filter(toggleProperties => !!toggleProperties),
          take(1)
        ))
      ).subscribe((toggleProperty: TogglePropertyInterface) => {
        this.followsYou = true;
        this.changeDetectorRef.markForCheck();
      });

      this.store$.dispatch(new LoadContentType({
        appLabel: "auth",
        model: "user"
      }));
    });
  }
  
  private _checkIsCurrentUser(): void {
    this.currentUser$.pipe(take(1)).subscribe(currentUser => {
      if (currentUser && this.user) {
        this.isCurrentUser = currentUser.id === this.user.id;
        this.changeDetectorRef.markForCheck();
      } else if (currentUser && this.userId) {
        this.isCurrentUser = currentUser.id === this.userId;
        this.changeDetectorRef.markForCheck();
      }
    });
  }
}
