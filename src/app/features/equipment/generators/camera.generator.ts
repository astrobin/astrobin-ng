import { CameraInterface, CameraType } from "@features/equipment/types/camera.interface";
import { SensorGenerator } from "@features/equipment/generators/sensor.generator";
import { BrandGenerator } from "@features/equipment/generators/brand.generator";
import { EditProposalInterface } from "@features/equipment/types/edit-proposal.interface";
import { EquipmentItemType } from "@features/equipment/types/equipment-item-base.interface";

export class CameraGenerator {
  static camera(source: Partial<CameraInterface> = {}): CameraInterface {
    return {
      id: source.id || 1,
      created: source.created || "1970-01-01",
      updated: source.updated || "1970-01-01",
      createdBy: source.createdBy || 1,
      klass: EquipmentItemType.CAMERA,
      brand: source.brand || BrandGenerator.brand().id,
      name: source.name || "Test camera",
      image: source.image || "https://cdn.astrobin.com/images/foo.jpg",
      type: source.type || CameraType.DSLR_MIRRORLESS,
      sensor: source.sensor || SensorGenerator.sensor().id,
      modified: source.modified !== undefined ? source.modified : false,
      cooled: source.cooled !== undefined ? source.cooled : true,
      maxCooling: source.maxCooling !== undefined ? source.maxCooling : 50,
      backFocus: source.backFocus !== undefined ? source.backFocus : 10
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
        editProposalReviewStatus: source.editProposalReviewStatus || null
      }
    };
  }
}
