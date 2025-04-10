import { Routes } from "@angular/router";
import { AuthGuardService } from "@core/services/guards/auth-guard.service";
import { GroupGuardService } from "@core/services/guards/group-guard.service";
import { JudgementQueueComponent } from "@features/iotd/pages/judgement-queue/judgement-queue.component";
import { ReviewQueueComponent } from "@features/iotd/pages/review-queue/review-queue.component";
import { SubmissionQueueComponent } from "@features/iotd/pages/submission-queue/submission-queue.component";

export const iotdRoutes: Routes = [
  {
    path: "submission-queue",
    component: SubmissionQueueComponent,
    canActivate: [AuthGuardService, GroupGuardService],
    data: { group: "iotd_submitters" }
  },
  {
    path: "review-queue",
    component: ReviewQueueComponent,
    canActivate: [AuthGuardService, GroupGuardService],
    data: { group: "iotd_reviewers" }
  },
  {
    path: "judgement-queue",
    component: JudgementQueueComponent,
    canActivate: [AuthGuardService, GroupGuardService],
    data: { group: "iotd_judges" }
  }
];
