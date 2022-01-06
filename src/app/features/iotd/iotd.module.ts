import { NgModule } from "@angular/core";
import { RouterModule } from "@angular/router";
import { ReviewEntryComponent } from "@features/iotd/components/review-entry/review-entry.component";
import { ReviewSlotsComponent } from "@features/iotd/components/review-slots/review-slots.component";
import { SubmissionEntryComponent } from "@features/iotd/components/submission-entry/submission-entry.component";
import { SubmissionSlotsComponent } from "@features/iotd/components/submission-slots/submission-slots.component";
import { routes } from "@features/iotd/iotd.routing";
import { ReviewQueueComponent } from "@features/iotd/pages/review-queue/review-queue.component";
import { IotdApiService } from "@features/iotd/services/iotd-api.service";
import { EffectsModule } from "@ngrx/effects";
import { StoreModule } from "@ngrx/store";
import { SharedModule } from "@shared/shared.module";
import { ConfirmDismissModalComponent } from "./components/confirm-dismiss-modal/confirm-dismiss-modal.component";
import { SubmissionQueueComponent } from "./pages/submission-queue/submission-queue.component";
import { IotdEffects } from "./store/iotd.effects";
import * as fromIotd from "./store/iotd.reducer";
import { QueueSortButtonComponent } from "./components/queue-sort-button/queue-sort-button.component";
import { JudgementQueueComponent } from "@features/iotd/pages/judgement-queue/judgement-queue.component";
import { FutureIotdSlotsComponent } from "@features/iotd/components/future-iotd-slots/future-iotd-slots.component";
import { JudgementEntryComponent } from "@features/iotd/components/judgement-entry/judgement-entry.component";

@NgModule({
  declarations: [
    SubmissionQueueComponent,
    SubmissionEntryComponent,
    SubmissionSlotsComponent,

    ReviewEntryComponent,
    ReviewSlotsComponent,
    ReviewQueueComponent,

    JudgementQueueComponent,
    JudgementEntryComponent,
    FutureIotdSlotsComponent,

    ConfirmDismissModalComponent,
    QueueSortButtonComponent
  ],
  imports: [
    RouterModule.forChild(routes),
    SharedModule,
    StoreModule.forFeature(fromIotd.iotdFeatureKey, fromIotd.reducer),
    EffectsModule.forFeature([IotdEffects])
  ],
  providers: [IotdApiService],
  exports: [RouterModule, SharedModule, StoreModule, EffectsModule]
})
export class IotdModule {}
