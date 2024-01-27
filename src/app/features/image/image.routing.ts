import { Routes } from "@angular/router";
import { ImageEditPageComponent } from "@features/image/pages/edit/image-edit-page.component";
import { ImageResolver } from "@shared/resolvers/image.resolver";
import { AuthGuardService } from "@shared/services/guards/auth-guard.service";
import { ImageOwnerGuardService } from "@shared/services/guards/image-owner-guard.service";
import { CurrentUsersGroupsResolver } from "@shared/resolvers/current-users-groups.resolver";
import { CurrentUsersLocationsResolver } from "@shared/resolvers/current-users-locations.resolver";
import { PendingChangesGuard } from "@shared/services/guards/pending-changes-guard.service";
import { CurrentUsersCollectionsResolver } from "@shared/resolvers/current-users-collections.resolver";

export const routes: Routes = [
  {
    path: ":imageId/edit",
    component: ImageEditPageComponent,
    canActivate: [AuthGuardService, ImageOwnerGuardService],
    canDeactivate: [PendingChangesGuard],
    resolve: {
      image: ImageResolver,
      groups: CurrentUsersGroupsResolver,
      collections: CurrentUsersCollectionsResolver,
      locations: CurrentUsersLocationsResolver
    },
    data: {
      skipThumbnails: true
    }
  }
];
