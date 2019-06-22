import {Column, Entity, PrimaryGeneratedColumn} from "typeorm";

@Entity()
export class Vendor {
    @PrimaryGeneratedColumn("uuid")
    id: string;

    @Column({length: 500})
    name: string;

    @Column("text")
    description: string;
}
