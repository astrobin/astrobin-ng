import { LoadingService } from "@shared/services/loading.service";
import { BaseService } from "@shared/services/base.service";
import { TranslateService } from "@ngx-translate/core";
import { Month } from "@shared/enums/month.enum";
import { Injectable } from "@angular/core";

@Injectable({
  providedIn: "root"
})
export class DateService extends BaseService {
  constructor(public readonly loadingService: LoadingService, public readonly translateService: TranslateService) {
    super(loadingService);
  }

  todayISODate() {
    // Returns today's date in YYYY-MM-DD format.
    return new Date().toISOString().split("T")[0];
  }

  humanizeMonth(month: Month): string {
    const map = {
      [Month.JAN]: this.translateService.instant("January"),
      [Month.FEB]: this.translateService.instant("February"),
      [Month.MAR]: this.translateService.instant("March"),
      [Month.APR]: this.translateService.instant("April"),
      [Month.MAY]: this.translateService.instant("May"),
      [Month.JUN]: this.translateService.instant("June"),
      [Month.JUL]: this.translateService.instant("July"),
      [Month.AUG]: this.translateService.instant("August"),
      [Month.SEP]: this.translateService.instant("September"),
      [Month.OCT]: this.translateService.instant("October"),
      [Month.NOV]: this.translateService.instant("November"),
      [Month.DEC]: this.translateService.instant("December")
    };

    return map[month];
  }
}
