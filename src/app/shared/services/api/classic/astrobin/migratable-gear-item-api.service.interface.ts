import { Observable } from "rxjs";
import {
  EquipmentItemBaseInterface,
  EquipmentItemType
} from "@features/equipment/interfaces/equipment-item-base.interface";

export enum MigrationFlag {
  WRONG_TYPE = "WRONG_TYPE",
  MULTIPLE_ITEMS = "MULTIPLE_ITEMS",
  DIY = "DIY",
  MIGRATE = "MIGRATE"
}

export interface MigratableGearItemApiServiceInterface {
  getRandomNonMigrated?(): Observable<any[]>;

  getNonMigratedCount?(): Observable<number>;

  getPendingMigrationReview?(): Observable<any[]>;

  lockForMigration?(gearId: number): Observable<void>;

  releaseLockForMigration?(gearId: number): Observable<void>;

  lockForMigrationReview?(gearId: number): Observable<void>;

  releaseLockForMigrationReview?(gearId: number): Observable<void>;

  setMigration?(
    gearId: number,
    migrationFlag: MigrationFlag,
    itemType?: EquipmentItemType,
    itemId?: EquipmentItemBaseInterface["id"]
  ): void;

  acceptMigration?(gearId: number): Observable<any>;
}
