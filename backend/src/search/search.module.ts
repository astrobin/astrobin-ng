import { Module } from "@nestjs/common";
import { ElasticsearchModule } from "@nestjs/elasticsearch";
import { ConfigService } from "../config.service";
import { SearchService } from "./search.service";

@Module({
    imports: [
        ElasticsearchModule.register({
            host: ConfigService.get("ELASTICSEARCH_HOST"),
            log: "trace",
        }),
    ],
    providers: [
        SearchService,
    ],
    exports: [
        SearchService,
    ],
})

export class SearchModule {
}
