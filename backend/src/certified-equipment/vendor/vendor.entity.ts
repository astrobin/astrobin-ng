import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";
import { VendorInterface } from "../../../../shared/interfaces/equipment/vendor.interface";
import { ModerationStatus } from "../../../../shared/enums/moderation-status.enum";

@Entity()
export class Vendor implements VendorInterface {
    @PrimaryGeneratedColumn("uuid")
    id: string;

    @Column({
        type: "varchar",
        length: 100,
        unique: true,
    })
    name: string;

    @Column({
        type: "text",
    })
    description: string;

    @Column({
        type: "varchar",
        length: "500",
        unique: true,
    })
    website: string;

    @Column({
        type: "varchar",
        length: "500",
        nullable: true,
        unique: true,
    })
    logo: string;

    @Column({
        type: "varchar",
        length: "30",
        update: false,
        comment: "id of AstroBin user",
    })
    createdBy: string;

    @Column({
        type: "integer",
        update: false,
    })
    createdWhen: number;

    @Column({
        type: "varchar",
        length: "30",
        comment: "id of AstroBin user",
    })
    updatedBy: string;

    @Column({
        type: "integer",
    })
    updatedWhen: number;

    @Column({
        type: "varchar",
        length: "255",
        nullable: true,
    })
    updateReason: string;

    @Column({
        type: "varchar",
        length: "30",
        comment: "id of AstroBin user",
        nullable: true,
    })
    moderatedBy: string;

    @Column({
        type: "integer",
        update: false,
        nullable: true,
    })
    moderatedWhen: number;

    @Column({
        type: "varchar",
        length: 20,
        nullable: true,
    })
    moderationStatus: ModerationStatus;
}
