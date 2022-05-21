import { Observable } from "rxjs";
import { EquipmentItemBaseInterface, EquipmentItemType } from "@features/equipment/types/equipment-item-base.interface";

export enum MigrationFlag {
  WRONG_TYPE = "WRONG_TYPE",
  MULTIPLE_ITEMS = "MULTIPLE_ITEMS",
  NOT_ENOUGH_INFO = "NOT_ENOUGH_INFO",
  MIGRATE = "MIGRATE"
}

export interface MigratableGearItemApiServiceInterface {
  getRandomNonMigrated?(isGlobal: boolean): Observable<any[]>;

  getNonMigratedCount?(isGlobal: boolean): Observable<number>;

  getSimilarNonMigrated?(gearId: number, isGlobal: boolean): Observable<any[]>;

  getSimilarNonMigratedByMakeAndName?(make: string, name: string, isGlobal: boolean): Observable<any[]>;

  lockForMigration?(gearId: number): Observable<void>;

  releaseLockForMigration?(gearId: number): Observable<void>;

  setMigration?(
    gearId: number,
    migrationFlag: MigrationFlag,
    itemType?: EquipmentItemType,
    itemId?: EquipmentItemBaseInterface["id"]
  ): void;
}
