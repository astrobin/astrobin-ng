import { Routes } from "@angular/router";
import { PermissionDeniedPageComponent } from "@features/permission-denied/pages/permission-denied-page/permission-denied-page.component";

export const permissionDeniedRoutes: Routes = [
  {
    path: "",
    component: PermissionDeniedPageComponent
  }
];
