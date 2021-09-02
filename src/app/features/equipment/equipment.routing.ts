import { Routes } from "@angular/router";
import { MigrationToolComponent } from "@features/equipment/pages/migration-tool/migration-tool.component";
import { AuthGuardService } from "@shared/services/guards/auth-guard.service";
import { GroupGuardService } from "@shared/services/guards/group-guard.service";
import { MigrationReviewComponent } from "@features/equipment/pages/migration-review/migration-review.component";
import { MigrationReviewItemComponent } from "@features/equipment/pages/migration-review-item/migration-review-item.component";
import { MigrationReviewItemGuardService } from "@features/equipment/services/migration-review-item-guard.service";

export const routes: Routes = [
  {
    path: "migration-tool",
    redirectTo: "migration-tool/camera"
  },
  {
    path: "migration-tool/:itemType",
    component: MigrationToolComponent,
    canActivate: [AuthGuardService, GroupGuardService],
    data: { group: "equipment_moderators" }
  },
  {
    path: "migration-review",
    component: MigrationReviewComponent,
    canActivate: [AuthGuardService, GroupGuardService],
    data: { group: "equipment_moderators" }
  },
  {
    path: "migration-review/:itemId",
    component: MigrationReviewItemComponent,
    canActivate: [AuthGuardService, GroupGuardService, MigrationReviewItemGuardService],
    data: { group: "equipment_moderators" }
  }
];
