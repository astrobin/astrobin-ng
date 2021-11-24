import { Observable } from "rxjs";
import { EquipmentItemBaseInterface, EquipmentItemType } from "@features/equipment/types/equipment-item-base.interface";
import { RejectMigrationReason } from "@features/equipment/components/migration/reject-migration-modal/reject-migration-modal.component";

export enum MigrationFlag {
  WRONG_TYPE = "WRONG_TYPE",
  MULTIPLE_ITEMS = "MULTIPLE_ITEMS",
  DIY = "DIY",
  NOT_ENOUGH_INFO = "NOT_ENOUGH_INFO",
  MIGRATE = "MIGRATE"
}

export interface MigratableGearItemApiServiceInterface {
  getRandomNonMigrated?(global: boolean): Observable<any[]>;

  getNonMigratedCount?(global: boolean): Observable<number>;

  getSimilarNonMigrated?(gearId: number, global: boolean): Observable<any[]>;

  getSimilarNonMigratedByMakeAndName?(make: string, name: string, global: boolean): Observable<any[]>;

  lockForMigration?(gearId: number): Observable<void>;

  releaseLockForMigration?(gearId: number): Observable<void>;

  setMigration?(
    gearId: number,
    migrationFlag: MigrationFlag,
    itemType?: EquipmentItemType,
    itemId?: EquipmentItemBaseInterface["id"]
  ): void;
}
