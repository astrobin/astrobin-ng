import { Routes } from "@angular/router";
import { UploaderPageComponent } from "@features/uploader/pages/uploader-page/uploader-page.component";
import { UploaderGuardService } from "@features/uploader/services/guards/uploader-guard.service";
import { AuthGuardService } from "@shared/services/guards/auth-guard.service";

export const routes: Routes = [
  {
    path: "",
    canActivate: [AuthGuardService],
    // Using children routes to make the AuthGuardService have priority over the UltimateSubscriptionGuardService.
    children: [
      {
        path: "",
        canActivate: [UploaderGuardService],
        component: UploaderPageComponent
      }
    ]
  }
];
