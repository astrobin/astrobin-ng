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
import { BBCodeToHtmlPipe } from "@shared/pipes/bbcode-to-html.pipe";
import { SlugifyPipe } from "@shared/pipes/slugify.pipe";
import { Nl2BrPipe } from "@shared/pipes/nl2br.pipe";
import { IsMarketplaceModeratorPipe } from "@shared/pipes/is-marketplace-moderator.pipe";
import { IsBetaTesterPipe } from "@shared/pipes/is-beta-tester.pipe";
import { YesNoIconPipe } from "@shared/pipes/yes-no-icon.pipe";
import { KeysPipe } from "@shared/pipes/keys.pipe";

const pipes = [
  BBCodeToHtmlPipe,
  CamelCaseToSentenceCasePipe,
  EnsureUrlProtocolPipe,
  IsBetaTesterPipe,
  IsContentModeratorPipe,
  IsImageModeratorPipe,
  IsIotdJudgePipe,
  IsIotdReviewerPipe,
  IsIotdStaffPipe,
  IsIotdSubmitterPipe,
  IsEquipmentModeratorPipe,
  IsMarketplaceModeratorPipe,
  IsProducerPipe,
  IsRetailerPipe,
  IsSuperUserPipe,
  IsInGroupPipe,
  HasValidUserSubscriptionPipe,
  LocalDatePipe,
  YesNoPipe,
  SlugifyPipe,
  Nl2BrPipe,
  YesNoIconPipe,
  KeysPipe
];

@NgModule({
  declarations: pipes,
  imports: [CommonModule],
  exports: pipes
})
export class PipesModule {
}
