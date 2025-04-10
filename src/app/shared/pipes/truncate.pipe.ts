import type { PipeTransform } from "@angular/core";
import { Pipe } from "@angular/core";

@Pipe({
  name: "truncate"
})
export class TruncatePipe implements PipeTransform {
  transform(value: string, limit = 25, completeWords = false, ellipsis = "...") {
    if (!value) {
      return value;
    }
    if (limit <= 0) {
      return ellipsis;
    }
    if (value.length <= limit) {
      return value;
    }

    let truncatedLength = limit - ellipsis.length;

    if (completeWords) {
      truncatedLength = value.slice(0, truncatedLength).lastIndexOf(" ");
      // Handle case where no spaces are found
      if (truncatedLength === -1) {
        return ellipsis;
      }
    }

    return value.slice(0, truncatedLength) + ellipsis;
  }
}
