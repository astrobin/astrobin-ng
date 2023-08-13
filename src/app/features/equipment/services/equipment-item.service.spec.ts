import { TestBed } from "@angular/core/testing";
import { MockBuilder } from "ng-mocks";
import { AppModule } from "@app/app.module";
import { EquipmentItemService } from "@features/equipment/services/equipment-item.service";
import { CameraGenerator } from "@features/equipment/generators/camera.generator";
import { EditProposalReviewStatus } from "@features/equipment/types/edit-proposal.interface";
import {
  EquipmentItemReviewerDecision,
  EquipmentItemReviewerRejectionReason
} from "@features/equipment/types/equipment-item-base.interface";
import { CameraDisplayProperty, CameraService } from "@features/equipment/services/camera.service";

describe("EquipmentItemService", () => {
  let service: EquipmentItemService;
  let cameraService: CameraService;

  beforeEach(async () => {
    await MockBuilder(EquipmentItemService, AppModule);
    service = TestBed.inject(EquipmentItemService);
    cameraService = TestBed.inject(CameraService);

    jest.spyOn(service.equipmentItemServiceFactory, "getService").mockReturnValue(cameraService);
    jest.spyOn(cameraService, "getSupportedPrintableProperties").mockReturnValue([
      CameraDisplayProperty.NAME,
      CameraDisplayProperty.TYPE,
      CameraDisplayProperty.SENSOR,
      CameraDisplayProperty.COOLED,
      CameraDisplayProperty.MAX_COOLING,
      CameraDisplayProperty.BACK_FOCUS,
      CameraDisplayProperty.MODIFIED
    ]);
  });

  it("should be created", () => {
    expect(service).toBeTruthy();
  });

  describe("changes", () => {
    describe("for cameras", () => {
      it("should be empty if there are no changes", done => {
        const item1 = CameraGenerator.camera();
        const item2 = CameraGenerator.editProposal(item1);

        service.changes(item1, item2).subscribe(changes => {
          expect(changes).toEqual([]);
          done();
        });
      });

      it("should be empty if the only changes are changes that should be ignored", done => {
        const item1 = CameraGenerator.camera();
        const item2 = {
          ...CameraGenerator.editProposal(item1),
          ...{
            id: 1234,
            created: "1981-05-09",
            createdBy: 1234,
            updated: "1981-05-09",
            deleted: "1981-05-09",

            reviewedBy: 1234,
            reviewedTimestamp: "1981-05-09",
            reviewerDecision: EquipmentItemReviewerDecision.APPROVED,
            reviewerRejectionReason: EquipmentItemReviewerRejectionReason.INSUFFICIENT_DATA,
            reviewerComment: "test",

            editProposalOriginalProperties: "",
            editProposalTarget: 1234,
            editProposalBy: 1234,
            editProposalCreated: "1981-05-09",
            editProposalUpdated: "1981-05-09",
            editProposalIp: "127.0.0.1",
            editProposalComment: "test",
            editProposalReviewedBy: 1234,
            editProposalReviewTimestamp: "1981-05-09",
            editProposalReviewIp: "127.0.0.1",
            editProposalReviewComment: "test",
            editProposalReviewStatus: EditProposalReviewStatus.APPROVED
          }
        };

        service.changes(item1, item2).subscribe(changes => {
          expect(changes).toEqual([]);
          done();
        });
      });

      it("should be populated with the changed properties if editProposalOriginalProperties is empty", done => {
        const item1 = CameraGenerator.camera({ cooled: false, maxCooling: null, backFocus: 40.5 });
        const item2 = CameraGenerator.editProposal({ ...item1, ...{ cooled: true, maxCooling: 20, backFocus: 41 } });

        service.changes(item1, item2).subscribe(changes => {
          expect(changes).toEqual([
            {
              propertyName: "cooled",
              before: false,
              after: true
            },
            {
              propertyName: "maxCooling",
              before: null,
              after: 20
            },
            {
              propertyName: "backFocus",
              before: 40.5,
              after: 41
            }
          ]);
          done();
        });
      });

      it("should be populated with the changed properties if editProposalOriginalProperties is non-empty", done => {
        const item1 = CameraGenerator.camera({ cooled: true, maxCooling: 20, backFocus: 41 });
        const item2 = CameraGenerator.editProposal({
          ...item1,
          ...{
            editProposalReviewStatus: EditProposalReviewStatus.APPROVED,
            editProposalOriginalProperties: "cooled=false,max_cooling=null,back_focus=40.5"
          }
        });

        service.changes(item1, item2).subscribe(changes => {
          expect(changes).toEqual([
            {
              propertyName: "cooled",
              before: false,
              after: true
            },
            {
              propertyName: "maxCooling",
              before: null,
              after: 20
            },
            {
              propertyName: "backFocus",
              before: 40.5,
              after: 41
            }
          ]);
          done();
        });
      });
    });
  });
});
