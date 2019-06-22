import {BeforeInsert, Column, Entity, PrimaryGeneratedColumn} from "typeorm";
import * as crypto from "crypto";

@Entity()
export class User {
    @PrimaryGeneratedColumn("uuid")
    id: string;

    @Column()
    name: string;

    @Column()
    email: string;

    @Column()
    password: string;

    @BeforeInsert()
    hashPassword() {
        this.password = crypto.createHmac("sha256", this.password).digest("hex");
    }
}
