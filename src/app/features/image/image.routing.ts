import { Routes } from "@angular/router";
import { ImageEditPageComponent } from "@features/image/pages/edit/image-edit-page.component";
import { ImageResolver } from "@shared/resolvers/image.resolver";
import { AuthGuardService } from "@shared/services/guards/auth-guard.service";
import { ImageOwnerGuardService } from "@shared/services/guards/image-owner-guard.service";
import { ImageUserGroupsResolver } from "@shared/resolvers/image-user-groups.resolver";
import { CurrentUsersLocationsResolver } from "@shared/resolvers/current-users-locations.resolver";
import { PendingChangesGuard } from "@shared/services/guards/pending-changes-guard.service";
import { ImageUserCollectionsResolver } from "@shared/resolvers/image-user-collections-resolver.service";
import { ImagePageComponent } from "@features/image/pages/image/image-page.component";

export const imageRoutes: Routes = [
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
    resolve: {
      image: ImageResolver,
    },
  }
];
