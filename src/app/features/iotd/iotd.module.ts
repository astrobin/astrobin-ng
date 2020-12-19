import { NgModule } from "@angular/core";
import { RouterModule } from "@angular/router";
import { routes } from "@features/iotd/iotd.routing";
import { SubmissionQueueApiService } from "@features/iotd/services/submission-queue-api.service";
import { EffectsModule } from "@ngrx/effects";
import { StoreModule } from "@ngrx/store";
import { SharedModule } from "@shared/shared.module";
import { SubmissionQueueComponent } from "./pages/submission-queue/submission-queue.component";
import { SubmissionQueueEffects } from "./store/submission-queue.effects";
import * as fromSubmissionQueue from "./store/submission-queue.reducer";

@NgModule({
  declarations: [SubmissionQueueComponent],
  imports: [
    RouterModule.forChild(routes),
    SharedModule,
    StoreModule.forFeature(fromSubmissionQueue.submissionQueueFeatureKey, fromSubmissionQueue.reducer),
    EffectsModule.forFeature([SubmissionQueueEffects])
  ],
  providers: [SubmissionQueueApiService]
})
export class IotdModule {}
