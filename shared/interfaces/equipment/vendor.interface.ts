import { ModerationStatus } from "../../enums/moderation-status.enum";

export interface VendorInterface {
    id: string;

    // Name of the vendor, e.g. XYZ Inc.
    name: string;

    // URL of their website.
    website: string;

    // Minimum 100 characters.
    description: string;

    // URL of the image.
    logo: string;

    // AstroBin user who created this.
    createdBy: string;

    // Timestamp of creation.
    createdWhen: number;

    // AstroBin user who updated this.
    updatedBy: string;

    // Timestamp of update.
    updatedWhen: number;

    // Why was this updated?
    updateReason: string;

    // AstroBin user who moderated this.
    moderatedBy: string;

    // Timestamp of moderation.
    moderatedWhen: number;

    // Status after moderation.
    moderationStatus: ModerationStatus;
}
