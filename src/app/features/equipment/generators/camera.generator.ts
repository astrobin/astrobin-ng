import { BrandGenerator } from "@features/equipment/generators/brand.generator";
import { SensorGenerator } from "@features/equipment/generators/sensor.generator";
import type { CameraInterface } from "@features/equipment/types/camera.interface";
import { CameraType } from "@features/equipment/types/camera.interface";
import type { EditProposalInterface } from "@features/equipment/types/edit-proposal.interface";
import { EquipmentItemType } from "@features/equipment/types/equipment-item-base.interface";

export class CameraGenerator {
  static camera(source: Partial<CameraInterface> = {}): CameraInterface {
    const generatedBrand = BrandGenerator.brand();

    return {
      id: source.id || 1,
      created: source.created || "1970-01-01",
      updated: source.updated || "1970-01-01",
      lastAddedOrRemovedFromImage: source.updated || "1970-01-01",
      createdBy: source.createdBy || 1,
      assignee: source.assignee || null,
      klass: EquipmentItemType.CAMERA,
      brand: source.brand || generatedBrand.id,
      brandName: source.brandName || generatedBrand.name,
      name: source.name || "Test camera",
      website: source.website || "https://www.test-camera.com",
      image: source.image || "https://cdn.astrobin.com/images/foo.jpg",
      communityNotes: null,
      type: source.type || CameraType.DSLR_MIRRORLESS,
      sensor: source.sensor || SensorGenerator.sensor().id,
      modified: source.modified !== undefined ? source.modified : false,
      cooled: source.cooled !== undefined ? source.cooled : true,
      maxCooling: source.maxCooling !== undefined ? source.maxCooling : 50,
      backFocus: source.backFocus !== undefined ? source.backFocus : 10,
      frozenAsAmbiguous: null,
      userCount: null,
      imageCount: null,
      variantOf: null,
      variants: [],
      forum: null,
      listings: {
        itemListings: [],
        brandListings: [],
        allowFullRetailerIntegration: false
      },
      followed: false,
      contentType: 1
    };
  }

  static editProposal(
    source: Partial<EditProposalInterface<CameraInterface>> = {}
  ): EditProposalInterface<CameraInterface> {
    return {
      ...CameraGenerator.camera(source),
      ...{
        editProposalOriginalProperties: source.editProposalOriginalProperties || "",
        editProposalTarget: source.editProposalTarget || 1,
        editProposalBy: source.editProposalBy || 1,
        editProposalCreated: source.editProposalCreated || "1970-01-01",
        editProposalUpdated: source.editProposalUpdated || "1970-01-01",
        editProposalIp: source.editProposalIp || "127.0.0.1",
        editProposalComment: source.editProposalComment || "Comment",
        editProposalReviewedBy: source.editProposalReviewedBy || null,
        editProposalReviewTimestamp: source.editProposalReviewTimestamp || null,
        editProposalReviewIp: source.editProposalReviewIp || null,
        editProposalReviewComment: source.editProposalReviewComment || null,
        editProposalReviewStatus: source.editProposalReviewStatus || null,
        editProposalAssignee: source.editProposalAssignee || null
      }
    };
  }
}
