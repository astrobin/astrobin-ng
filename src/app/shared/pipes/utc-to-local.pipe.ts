import type { PipeTransform } from "@angular/core";
import { Pipe } from "@angular/core";

@Pipe({
  name: "utcToLocal"
})
export class UtcToLocalPipe implements PipeTransform {
  transform(value: Date | string): Date {
    let utcDate: Date;

    // Convert string to Date if necessary
    if (typeof value === "string") {
      utcDate = new Date(value);
    } else {
      utcDate = value;
    }

    // Adjust the UTC date to local time
    const timezoneOffset = utcDate.getTimezoneOffset() * 60000;
    return new Date(utcDate.getTime() - timezoneOffset);
  }
}
