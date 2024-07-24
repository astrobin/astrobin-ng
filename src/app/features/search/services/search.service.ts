import { BaseService } from "@shared/services/base.service";
import { LoadingService } from "@shared/services/loading.service";
import { Injectable } from "@angular/core";
import { SearchModelInterface } from "@features/search/interfaces/search-model.interface";

@Injectable({
  providedIn: "root"
})
export class SearchService extends BaseService {
  constructor(public readonly loadingService: LoadingService) {
    super(loadingService);
  }

  search(model: SearchModelInterface) {
    console.log("Searching for:", model);
  }
}
