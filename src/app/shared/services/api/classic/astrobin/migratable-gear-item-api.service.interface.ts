import { Observable } from "rxjs";
import {
  EquipmentItemBaseInterface,
  EquipmentItemType
} from "@features/equipment/interfaces/equipment-item-base.interface";
import { RejectMigrationReason } from "@features/equipment/components/migration/reject-migration-modal/reject-migration-modal.component";

export enum MigrationFlag {
  WRONG_TYPE = "WRONG_TYPE",
  MULTIPLE_ITEMS = "MULTIPLE_ITEMS",
  DIY = "DIY",
  NOT_ENOUGH_INFO = "NOT_ENOUGH_INFO",
  MIGRATE = "MIGRATE"
}

export interface MigratableGearItemApiServiceInterface {
  getRandomNonMigrated?(): Observable<any[]>;

  getNonMigratedCount?(): Observable<number>;

  getPendingMigrationReview?(): Observable<any[]>;

  getSimilarNonMigrated?(): Observable<any[]>;

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

  approveMigration?(gearId: number): Observable<any>;

  rejectMigration?(gearId: number, reason: RejectMigrationReason, comment: string): Observable<any>;
}
