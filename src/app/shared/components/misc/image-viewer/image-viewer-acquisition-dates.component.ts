import { Component, Input, OnChanges, SimpleChanges } from "@angular/core";
import { DateService } from "@core/services/date.service";

@Component({
  selector: "astrobin-image-viewer-acquisition-dates",
  template: `
    <ng-container *ngIf="contiguousRanges?.length > 1 && dates?.length > 2; else singleRangeTemplate">
      <div
        [ngbTooltip]="fullDatesTemplate"
        container="body"
        data-toggle="tooltip"
        triggers="hover click"
      >
        {{ dateRange }}
      </div>
    </ng-container>

    <ng-template #singleRangeTemplate>
      {{ dateRange }}
    </ng-template>

    <ng-template #fullDatesTemplate>
      <div *ngFor="let date_ of distinctDates">
        {{ date_ ? (date_ | date: "mediumDate") : "n/a" | translate }}
      </div>
    </ng-template>
  `
})
export class ImageViewerAcquisitionDatesComponent implements OnChanges {
  @Input()
  dates: string[];

  dateRange: string;
  contiguousRanges: number[][];
  distinctDates: string[];

  constructor(
    public readonly dateService: DateService
  ) {
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes.dates && changes.dates.currentValue) {
      this.setDates(changes.dates.currentValue);
    }
  }

  setDates(dates: string[]) {
    this.dateRange = this.dateService.formatDates(dates);
    this.contiguousRanges = this.dateService.getContiguousRanges(dates.map(date => new Date(date).getTime()));
    this.distinctDates = this.dates
      .map(date => new Date(date).getTime())
      .sort((a, b) => a - b)
      .filter((date, index, self) => self.indexOf(date) === index)
      .map(date => new Date(date).toISOString().split("T")[0]);
  }
}
