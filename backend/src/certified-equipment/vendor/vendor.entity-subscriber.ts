import { Connection, EntitySubscriberInterface, InsertEvent, RemoveEvent, UpdateEvent } from "typeorm";
import { Vendor } from "./vendor.entity";
import { SearchService } from "../../search/search.service";
import { Injectable } from "@nestjs/common";
import { InjectConnection } from "@nestjs/typeorm";
import { VendorService } from "./vendor.service";

@Injectable()
export class VendorEntitySubscriber implements EntitySubscriberInterface<Vendor> {
    public constructor(
        @InjectConnection() connection: Connection,
        public search: SearchService) {
        connection.subscribers.push(this);
    }

    public listenTo(): typeof Vendor {
        return Vendor;
    }

    public beforeInsert(event: InsertEvent<Vendor>): void {
        const now = new Date().getTime();
        event.entity.createdWhen = now;
        event.entity.updatedWhen = now;
    }

    public afterInsert(event: InsertEvent<Vendor>): Promise<any> | void {
        this.search.backend.create(VendorService.searchUpsertParams(event.entity)).subscribe();
    }

    public afterUpdate(event: UpdateEvent<Vendor>): Promise<any> | void {
        this.search.backend.update(VendorService.searchUpsertParams(event.entity)).subscribe();
    }

    public afterRemove(event: RemoveEvent<Vendor>): Promise<any> | void {
        this.search.backend.delete({
            index: VendorService.SEARCH_INDEX,
            type: VendorService.SEARCH_TYPE,
            id: event.entity.id,
        }).subscribe();
    }
}
