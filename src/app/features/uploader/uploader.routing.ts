import { Routes } from "@angular/router";
import { UploaderPageComponent } from "@features/uploader/pages/uploader-page/uploader-page.component";
import { AuthGuardService } from "@shared/services/guards/auth-guard.service";
import { UltimateSubscriptionGuardService } from "@shared/services/guards/ultimate-subscription-guard.service";

export const routes: Routes = [
  {
    path: "",
    canActivate: [AuthGuardService],
    // Using children routes to make the AuthGuardService have priority over the UltimateSubscriptionGuardService.
    children: [
      {
        path: "",
        canActivate: [UltimateSubscriptionGuardService],
        component: UploaderPageComponent
      }
    ]
  }
];
