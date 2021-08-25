import { Routes } from "@angular/router";
import { MigrationToolComponent } from "@features/equipment/pages/migration-tool/migration-tool.component";
import { AuthGuardService } from "@shared/services/guards/auth-guard.service";
import { GroupGuardService } from "@shared/services/guards/group-guard.service";
import { MigrationReviewComponent } from "@features/equipment/pages/migration-review/migration-review.component";

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
  }
];
