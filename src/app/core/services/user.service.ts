import { Injectable } from "@angular/core";
import { AuthGroupInterface } from "@core/interfaces/auth-group.interface";
import { UserInterface } from "@core/interfaces/user.interface";
import { BaseService } from "@core/services/base.service";
import { UserServiceInterface } from "@core/services/user.service-interface";
import { Observable } from "rxjs";
import { selectUser } from "@features/account/store/auth.selectors";
import { Store } from "@ngrx/store";
import { MainState } from "@app/store/state";
import { LoadingService } from "@core/services/loading.service";
import { GroupInterface } from "@core/interfaces/group.interface";
import { ClassicRoutesService } from "@core/services/classic-routes.service";
import { Router } from "@angular/router";
import { WindowRefService } from "@core/services/window-ref.service";
import { CollectionInterface } from "@core/interfaces/collection.interface";
import { ImageViewerService } from "@core/services/image-viewer.service";

@Injectable({
  providedIn: "root"
})
export class UserService extends BaseService implements UserServiceInterface {
  constructor(
    public readonly store$: Store<MainState>,
    public readonly loadingService: LoadingService,
    public readonly classicRoutesService: ClassicRoutesService,
    public readonly router: Router,
    public readonly windowRefService: WindowRefService,
    public readonly imageViewerService: ImageViewerService
  ) {
    super(loadingService);
  }

  getUser$(userId: UserInterface["id"]): Observable<UserInterface> {
    return this.store$.select(selectUser, userId);
  }

  isInGroup(user: UserInterface, name: string): boolean {
    if (!user || !user.groups) {
      return false;
    }
    return user.groups.filter((group: AuthGroupInterface) => group.name === name).length > 0;
  }

  isInAstroBinGroup(user: UserInterface, name: string): boolean {
    if (!user || !user.astrobinGroups) {
      return false;
    }

    return user.astrobinGroups.filter((group: GroupInterface) => group.name === name).length > 0;
  }

  getGalleryUrl(username: UserInterface["username"], newGalleryExperience: boolean): string {
    if (newGalleryExperience) {
      return `/u/${username}#gallery`;
    }

    return this.classicRoutesService.GALLERY(username);
  }

  getStagingUrl(username: UserInterface["username"], newGalleryExperience: boolean): string {
    if (newGalleryExperience) {
      return `/u/${username}#staging`;
    }

    return this.classicRoutesService.STAGING_GALLERY(username);
  }

  getCollectionUrl(
    username: UserInterface["username"],
    collectionId: CollectionInterface["id"],
    newGalleryExperience: boolean
  ): string {
    if (newGalleryExperience) {
      return `/u/${username}?collection=${collectionId}#gallery`;
    }

    return this.classicRoutesService.GALLERY(username) + 'collections/' + collectionId;
  }

  openGallery(username: UserInterface["username"], newGalleryExperience: boolean): void {
    if (newGalleryExperience) {
      this.router.navigateByUrl('/u/' + username).then(() => {
        this.imageViewerService.closeSlideShow(false);
      });
    } else {
      this.windowRefService.nativeWindow.location.href = this.classicRoutesService.GALLERY(username);
    }
  }

  openStaging(username: UserInterface["username"], newGalleryExperience: boolean): void {
    if (newGalleryExperience) {
      this.router.navigateByUrl('/u/' + username + '#staging').then(() => {
        this.imageViewerService.closeSlideShow(false);
      });
    } else {
      this.windowRefService.nativeWindow.location.href = this.classicRoutesService.STAGING_GALLERY(username);
    }
  }

  openCollection(
    username: UserInterface["username"],
    collectionId: CollectionInterface["id"],
    newGalleryExperience: boolean
  ): void {
    if (newGalleryExperience) {
      this.router.navigateByUrl('/u/' + username + '?collection=' + collectionId).then(() => {
        this.imageViewerService.closeSlideShow(false);
      });
    } else {
      this.windowRefService.nativeWindow.location.href = this.classicRoutesService.GALLERY(username) + 'collections/' + collectionId;
    }
  }
}
