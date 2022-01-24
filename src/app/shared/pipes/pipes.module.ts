import { CommonModule } from "@angular/common";
import { NgModule } from "@angular/core";
import { HasValidUserSubscriptionPipe } from "@shared/pipes/has-valid-user-subscription.pipe";
import { LocalDatePipe } from "@shared/pipes/local-date.pipe";
import { YesNoPipe } from "@shared/pipes/yes-no.pipe";
import { EnsureUrlProtocolPipe } from "./ensure-url-protocol.pipe";
import { IsContentModeratorPipe } from "./is-content-moderator.pipe";
import { IsImageModeratorPipe } from "./is-image-moderator.pipe";
import { IsIotdJudgePipe } from "./is-iotd-judge.pipe";
import { IsIotdReviewerPipe } from "./is-iotd-reviewer.pipe";
import { IsIotdStaffPipe } from "./is-iotd-staff.pipe";
import { IsIotdSubmitterPipe } from "./is-iotd-submitter.pipe";
import { IsProducerPipe } from "./is-producer.pipe";
import { IsRetailerPipe } from "./is-retailer.pipe";
import { IsSuperUserPipe } from "./is-superuser.pipe";
import { CamelCaseToSentenceCasePipe } from "@shared/pipes/camel-case-to-sentence-case.pipe";
import { IsEquipmentModeratorPipe } from "@shared/pipes/is-equipment-moderator.pipe";
import { IsInGroupPipe } from "@shared/pipes/is-in-group.pipe";
import { FileSizePipe } from "@shared/pipes/filesize.pipe";

const pipes = [
  CamelCaseToSentenceCasePipe,
  EnsureUrlProtocolPipe,
  FileSizePipe,
  IsContentModeratorPipe,
  IsImageModeratorPipe,
  IsIotdJudgePipe,
  IsIotdReviewerPipe,
  IsIotdStaffPipe,
  IsIotdSubmitterPipe,
  IsEquipmentModeratorPipe,
  IsProducerPipe,
  IsRetailerPipe,
  IsSuperUserPipe,
  IsInGroupPipe,
  HasValidUserSubscriptionPipe,
  LocalDatePipe,
  YesNoPipe
];

@NgModule({
  declarations: pipes,
  imports: [CommonModule],
  exports: pipes
})
export class PipesModule {}
