import { Injectable } from "@angular/core";
import { NgbPaginationConfig } from "@ng-bootstrap/ng-bootstrap";
import { BaseService } from "@shared/services/base.service";
import { LoadingService } from "@shared/services/loading.service";

@Injectable({
  providedIn: "root"
})
export class PaginationService extends BaseService {
  constructor(readonly loadingService: LoadingService, public readonly paginationConfig: NgbPaginationConfig) {
    super(loadingService);
  }

  showPagination(count: number): boolean {
    return count > this.paginationConfig.pageSize;
  }
}
