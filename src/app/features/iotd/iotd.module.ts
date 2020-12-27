import { NgModule } from "@angular/core";
import { RouterModule } from "@angular/router";
import { routes } from "@features/iotd/iotd.routing";
import { SubmissionQueueApiService } from "@features/iotd/services/submission-queue-api.service";
import { EffectsModule } from "@ngrx/effects";
import { StoreModule } from "@ngrx/store";
import { SharedModule } from "@shared/shared.module";
import { PromotionEntryComponent } from "./components/promotion-entry/promotion-entry.component";
import { PromotionSlotsComponent } from "./components/promotion-slots/promotion-slots.component";
import { SubmissionQueueComponent } from "./pages/submission-queue/submission-queue.component";
import { IotdEffects } from "./store/iotd.effects";
import * as fromIotd from "./store/iotd.reducer";

@NgModule({
  declarations: [SubmissionQueueComponent, PromotionSlotsComponent, PromotionEntryComponent],
  imports: [
    RouterModule.forChild(routes),
    SharedModule,
    StoreModule.forFeature(fromIotd.iotdFeatureKey, fromIotd.reducer),
    EffectsModule.forFeature([IotdEffects])
  ],
  providers: [SubmissionQueueApiService],
  exports: [RouterModule, SharedModule, StoreModule, EffectsModule]
})
export class IotdModule {}
