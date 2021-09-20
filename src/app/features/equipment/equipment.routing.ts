import { Routes } from "@angular/router";
import { MigrationToolComponent } from "@features/equipment/pages/migration/migration-tool/migration-tool.component";
import { AuthGuardService } from "@shared/services/guards/auth-guard.service";
import { GroupGuardService } from "@shared/services/guards/group-guard.service";
import { MigrationReviewComponent } from "@features/equipment/pages/migration/migration-review/migration-review.component";
import { MigrationReviewItemComponent } from "@features/equipment/pages/migration/migration-review-item/migration-review-item.component";
import { MigrationReviewItemGuardService } from "@features/equipment/services/migration-review-item-guard.service";
import { MigrationExplorerComponent } from "@features/equipment/pages/migration/migration-explorer/migration-explorer.component";
import { ExplorerComponent } from "@features/equipment/pages/explorer/explorer.component";

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
  },
  {
    path: "migration-explorer",
    component: MigrationExplorerComponent,
    canActivate: [AuthGuardService, GroupGuardService],
    data: { group: "equipment_moderators" }
  },
  {
    path: "explorer",
    children: [
      {
        path: "",
        pathMatch: "full",
        redirectTo: "camera"
      },
      {
        path: ":itemType/:itemId/:itemSlug",
        pathMatch: "full",
        component: ExplorerComponent
      },
      {
        path: ":itemType/:itemId",
        pathMatch: "full",
        component: ExplorerComponent
      },
      {
        path: ":itemType",
        pathMatch: "full",
        component: ExplorerComponent
      }
    ]
  }
];
