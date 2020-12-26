import { Routes } from "@angular/router";
import { SubmissionQueueComponent } from "@features/iotd/pages/submission-queue/submission-queue.component";
import { AuthGuardService } from "@shared/services/guards/auth-guard.service";
import { GroupGuardService } from "@shared/services/guards/group-guard.service";

export const routes: Routes = [
  {
    path: "submission-queue",
    component: SubmissionQueueComponent,
    canActivate: [AuthGuardService, GroupGuardService],
    data: { group: "iotd_submitters" }
  }
];
