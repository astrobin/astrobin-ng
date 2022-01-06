import { Routes } from "@angular/router";
import { MigrationToolComponent } from "@features/equipment/pages/migration/migration-tool/migration-tool.component";
import { AuthGuardService } from "@shared/services/guards/auth-guard.service";
import { GroupGuardService } from "@shared/services/guards/group-guard.service";
import { MigrationReviewComponent } from "@features/equipment/pages/migration/migration-review/migration-review.component";
import { MigrationReviewItemComponent } from "@features/equipment/pages/migration/migration-review-item/migration-review-item.component";
import { MigrationReviewItemGuardService } from "@features/equipment/services/migration-review-item-guard.service";
import { MigrationExplorerComponent } from "@features/equipment/pages/migration/migration-explorer/migration-explorer.component";
import { ExplorerPageComponent } from "@features/equipment/pages/explorer/explorer-page.component";
import { PendingEditExplorerComponent } from "@features/equipment/pages/pending-edit-explorer/pending-edit-explorer.component";
import { PendingReviewExplorerComponent } from "@features/equipment/pages/pending-review-explorer/pending-review-explorer.component";
import { AZExplorerComponent } from "@features/equipment/pages/a-z-edit-explorer/a-z-explorer.component";
import { ReviewGearRenamingProposalsComponent } from "@features/equipment/pages/review-gear-renaming-proposals/review-gear-renaming-proposals.component";

export const routes: Routes = [
  {
    path: "review-gear-renaming-proposals/:itemType",
    component: ReviewGearRenamingProposalsComponent
  },
  {
    path: "migration-tool",
    redirectTo: "migration-tool/camera"
  },
  {
    path: "migration-tool/:itemType",
    component: MigrationToolComponent,
    canActivate: [AuthGuardService, GroupGuardService],
    data: { anyOfGroups: ["equipment_moderators", "own_equipment_migrators"] }
  },
  {
    path: "migration-review",
    component: MigrationReviewComponent,
    canActivate: [AuthGuardService, GroupGuardService],
    data: { group: "equipment_moderators" }
  },
  {
    path: "migration-review/:migrationStrategyId",
    component: MigrationReviewItemComponent,
    canActivate: [AuthGuardService, GroupGuardService, MigrationReviewItemGuardService],
    data: { group: "equipment_moderators" }
  },
  {
    path: "migration-explorer",
    canActivate: [AuthGuardService, GroupGuardService],
    data: { group: "equipment_moderators" },
    children: [
      {
        path: "",
        pathMatch: "full",
        redirectTo: "camera"
      },
      {
        path: ":itemType/:itemId/:itemSlug",
        pathMatch: "full",
        component: MigrationExplorerComponent
      },
      {
        path: ":itemType/:itemId",
        pathMatch: "full",
        component: MigrationExplorerComponent
      },
      {
        path: ":itemType",
        pathMatch: "full",
        component: MigrationExplorerComponent
      }
    ]
  },
  {
    path: "explorer",
    canActivate: [AuthGuardService, GroupGuardService],
    data: { anyOfGroups: ["equipment_moderators", "own_equipment_migrators"] },
    children: [
      {
        path: "",
        pathMatch: "full",
        redirectTo: "camera"
      },

      {
        path: ":itemType/:itemId/:itemSlug/edit-proposals/:editProposalId",
        pathMatch: "full",
        component: ExplorerPageComponent
      },
      {
        path: ":itemType/:itemId/:itemSlug",
        pathMatch: "full",
        component: ExplorerPageComponent
      },
      {
        path: ":itemType/:itemId",
        pathMatch: "full",
        component: ExplorerPageComponent
      },
      {
        path: ":itemType",
        pathMatch: "full",
        component: ExplorerPageComponent
      }
    ]
  },
  {
    path: "a-z-explorer/:itemType",
    component: AZExplorerComponent,
    canActivate: [AuthGuardService, GroupGuardService],
    data: { anyOfGroups: ["equipment_moderators", "own_equipment_migrators"] }
  },
  {
    path: "pending-review-explorer/:itemType",
    component: PendingReviewExplorerComponent,
    canActivate: [AuthGuardService, GroupGuardService],
    data: { anyOfGroups: ["equipment_moderators", "own_equipment_migrators"] }
  },
  {
    path: "pending-edit-explorer/:itemType",
    component: PendingEditExplorerComponent,
    canActivate: [AuthGuardService, GroupGuardService],
    data: { anyOfGroups: ["equipment_moderators", "own_equipment_migrators"] }
  }
];
