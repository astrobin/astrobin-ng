import type { JudgementImageInterface } from "@features/iotd/types/judgement-image.interface";
import type { ReviewImageInterface } from "@features/iotd/types/review-image.interface";
import type { SubmissionImageInterface } from "@features/iotd/types/submission-image.interface";

export type PromotionImageInterface = SubmissionImageInterface | ReviewImageInterface | JudgementImageInterface;
