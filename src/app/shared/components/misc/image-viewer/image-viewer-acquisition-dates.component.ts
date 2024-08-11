import { Component, Input, OnChanges, SimpleChanges } from "@angular/core";
import { DateService } from "@shared/services/date.service";

@Component({
  selector: "astrobin-image-viewer-acquisition-dates",
  template: `
    {{ dateRange }}
  `,
  styles: [`
  `]
})
export class ImageViewerAcquisitionDatesComponent implements OnChanges {
  @Input()
  dates: string[];

  dateRange: string;

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
  }
}
