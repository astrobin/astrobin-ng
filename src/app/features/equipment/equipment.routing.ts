import { Routes } from "@angular/router";
import { MigrationToolComponent } from "@features/equipment/pages/migration-tool/migration-tool.component";
import { AuthGuardService } from "@shared/services/guards/auth-guard.service";
import { GroupGuardService } from "@shared/services/guards/group-guard.service";

export const routes: Routes = [
  {
    path: "migration-tool",
    redirectTo: "migration-tool/cameras"
  },
  {
    path: "migration-tool/:itemType",
    component: MigrationToolComponent,
    canActivate: [AuthGuardService, GroupGuardService],
    data: { group: "equipment_moderators" }
  }
];
