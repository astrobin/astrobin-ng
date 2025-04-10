import { Injectable } from "@angular/core";
import type { Router } from "@angular/router";
import type { MainState } from "@app/store/state";
import type { AuthGroupInterface } from "@core/interfaces/auth-group.interface";
import type { CollectionInterface } from "@core/interfaces/collection.interface";
import type { GroupInterface } from "@core/interfaces/group.interface";
import type { UserInterface } from "@core/interfaces/user.interface";
import { BaseService } from "@core/services/base.service";
import type { ClassicRoutesService } from "@core/services/classic-routes.service";
import type { ImageViewerService } from "@core/services/image-viewer.service";
import type { LoadingService } from "@core/services/loading.service";
import type { UserServiceInterface } from "@core/services/user.service-interface";
import type { WindowRefService } from "@core/services/window-ref.service";
import { selectUser } from "@features/account/store/auth.selectors";
import type { Store } from "@ngrx/store";
import type { Observable } from "rxjs";

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
    newGalleryExperience: boolean,
    displayCollectionsOnPublicGallery: boolean
  ): string {
    const fragment = displayCollectionsOnPublicGallery ? "gallery" : "collections";
    if (newGalleryExperience) {
      return `/u/${username}?collection=${collectionId}#${fragment}`;
    }

    return this.classicRoutesService.GALLERY(username) + "collections/" + collectionId;
  }

  openGallery(username: UserInterface["username"], newGalleryExperience: boolean): void {
    if (newGalleryExperience) {
      this.router.navigateByUrl("/u/" + username).then(() => {
        this.imageViewerService.closeSlideShow(false);
      });
    } else {
      this.windowRefService.nativeWindow.location.href = this.classicRoutesService.GALLERY(username);
    }
  }

  openStaging(username: UserInterface["username"], newGalleryExperience: boolean): void {
    if (newGalleryExperience) {
      this.router.navigateByUrl("/u/" + username + "#staging").then(() => {
        this.imageViewerService.closeSlideShow(false);
      });
    } else {
      this.windowRefService.nativeWindow.location.href = this.classicRoutesService.STAGING_GALLERY(username);
    }
  }

  openCollection(
    username: UserInterface["username"],
    collectionId: CollectionInterface["id"],
    newGalleryExperience: boolean,
    displayCollectionsOnPublicGallery: boolean
  ): void {
    const url = this.getCollectionUrl(username, collectionId, newGalleryExperience, displayCollectionsOnPublicGallery);
    if (newGalleryExperience) {
      this.router.navigateByUrl(url).then(() => {
        this.imageViewerService.closeSlideShow(false);
      });
    } else {
      this.loadingService.setLoading(true);
      this.windowRefService.nativeWindow.location.href = url;
    }
  }
}
