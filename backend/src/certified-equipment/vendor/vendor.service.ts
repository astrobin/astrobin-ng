import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Vendor } from "./vendor.entity";
import { Repository } from "typeorm";
import { TypeOrmCrudService } from "@nestjsx/crud-typeorm";
import { Observable } from "rxjs";
import { map } from "rxjs/operators";
import { VendorInterface } from "@shared/interfaces/equipment/vendor.interface";
import { SearchService } from "../../search/search.service";

@Injectable()
export class VendorService extends TypeOrmCrudService<Vendor> {
    public static readonly SEARCH_INDEX = "certified-equipment";
    public static readonly SEARCH_TYPE = "vendor";

    constructor(
        @InjectRepository(Vendor) private readonly repository: Repository<Vendor>,
        public readonly search: SearchService) {
        super(repository);
    }

    public static searchUpsertParams(entity: Vendor) {
        return {
            index: VendorService.SEARCH_INDEX,
            type: VendorService.SEARCH_TYPE,
            id: entity.id,
            body: {
                doc: {
                    name: entity.name,
                    website: entity.website,
                    description: entity.description,
                },
                doc_as_upsert: true,
            },
        };
    }

    public findSimilar(name: string): Observable<VendorInterface[]> {
        return this.search.backend.search({
            index: "certified-equipment",
            type: "vendor",
            body: {
                query: {
                    fuzzy: {
                        name: {
                            value: name,
                            fuzziness: 10,
                        },
                    },
                },
            },
        }).pipe(
            map(response => response[0].hits.hits.map(hit => hit._source)),
        );
    }

    public rebuildSearchIndex(): Observable<VendorInterface[]> {
        return new Observable<VendorInterface[]>(observer => {
            this.search.backend.getClient().indices.delete({ index: VendorService.SEARCH_INDEX })
                .then(() => {
                    return this.repository.find();
                })
                .then(entities => {
                    entities.forEach(entity => {
                        this.search.backend.update(VendorService.searchUpsertParams(entity)).subscribe();
                    });
                    observer.next(entities);
                    observer.complete();
                });
        });
    }
}
