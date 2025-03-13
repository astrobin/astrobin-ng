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
import { HighlightPipe } from "@shared/pipes/highlight.pipe";
import { RemoveBrPipe } from "@shared/pipes/remove-br.pipe";
import { AddDaysPipe } from "@shared/pipes/add-days.pipe";
import { UtcToLocalPipe } from "@shared/pipes/utc-to-local.pipe";
import { NumberSuffixPipe } from "@shared/pipes/number-suffix.pipe";
import { TruncatePipe } from "@shared/pipes/truncate.pipe";
import { NormalizeNotificationLinkPipe } from "@shared/pipes/normalize-notification-link.pipe";
import { NotificationContextIconPipe } from "@shared/pipes/notification-context-icon.pipe";
import { NullOrUndefinedPipe } from "@shared/pipes/null-or-undefined.pipe";

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
  NullOrUndefinedPipe,
  YesNoPipe,
  SlugifyPipe,
  Nl2BrPipe,
  YesNoIconPipe,
  KeysPipe,
  HighlightPipe,
  RemoveBrPipe,
  AddDaysPipe,
  UtcToLocalPipe,
  NumberSuffixPipe,
  TruncatePipe,
  NormalizeNotificationLinkPipe,
  NotificationContextIconPipe
];

@NgModule({
  declarations: pipes,
  imports: [CommonModule],
  exports: pipes,
  providers: pipes
})
export class PipesModule {
}
