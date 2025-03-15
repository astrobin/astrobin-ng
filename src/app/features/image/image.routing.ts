import { Routes } from "@angular/router";
import { ImageEditPageComponent } from "@features/image/pages/edit/image-edit-page.component";
import { ImageResolver } from "@core/resolvers/image.resolver";
import { AuthGuardService } from "@core/services/guards/auth-guard.service";
import { ImageOwnerGuardService } from "@core/services/guards/image-owner-guard.service";
import { ImageUserGroupsResolver } from "@core/resolvers/image-user-groups.resolver";
import { CurrentUsersLocationsResolver } from "@core/resolvers/current-users-locations.resolver";
import { PendingChangesGuard } from "@core/services/guards/pending-changes-guard.service";
import { ImageUserCollectionsResolver } from "@core/resolvers/image-user-collections-resolver.service";
import { ImagePageComponent } from "@features/image/pages/image/image-page.component";
import { ImageEditRevisionPageComponent } from "@features/image/pages/edit-revision/image-edit-revision-page.component";
import { ImagePlateSolvingSettingsPageComponent } from "@features/image/pages/plate-solving-settings/image-plate-solving-settings-page.component";
import { PlateSolvingSettingsResolver } from "@core/resolvers/plate-solving-settings.resolver";
import { PlateSolvingAdvancedSettingsResolver } from "@core/resolvers/plate-solving-advanced-settings.resolver";
import { GalleryExperienceGuard } from "@core/services/guards/gallery-experience-guard.service";

export const imageRoutes: Routes = [
  {
    path: ":imageId/:revisionLabel/edit",
    component: ImageEditRevisionPageComponent,
    canActivate: [AuthGuardService, ImageOwnerGuardService],
    canDeactivate: [PendingChangesGuard],
    resolve: {
      image: ImageResolver,
    },
    data: {
      skipThumbnails: false
    }
  },
  {
    path: ":imageId/plate-solving-settings",
    component: ImagePlateSolvingSettingsPageComponent,
    canActivate: [AuthGuardService, ImageOwnerGuardService],
    canDeactivate: [PendingChangesGuard],
    resolve: {
      image: ImageResolver,
      basicSettings: PlateSolvingSettingsResolver,
      advancedSettings: PlateSolvingAdvancedSettingsResolver
    },
    data: {
      skipThumbnails: true
    }
  },
  {
    path: ":imageId/edit",
    component: ImageEditPageComponent,
    canActivate: [AuthGuardService, ImageOwnerGuardService],
    canDeactivate: [PendingChangesGuard],
    resolve: {
      image: ImageResolver,
      groups: ImageUserGroupsResolver,
      collections: ImageUserCollectionsResolver,
      locations: CurrentUsersLocationsResolver
    },
    data: {
      skipThumbnails: true
    }
  },
  {
    path: ":imageId",
    component: ImagePageComponent,
    canActivate: [GalleryExperienceGuard],
    resolve: {
      image: ImageResolver,
    },
    data: {
      fluid: true
    }
  }
];
