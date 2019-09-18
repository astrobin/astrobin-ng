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

    // Date of creation.
    createdWhen: Date;

    // AstroBin user who updated this.
    updatedBy: string;

    // Date of update.
    updatedWhen: Date;

    // Why was this updated?
    updateReason: string;

    // AstroBin user who moderated this.
    moderatedBy: string;

    // Date of moderation.
    moderatedWhen: Date;

    // Status after moderation.
    moderationStatus: ModerationStatus;
}