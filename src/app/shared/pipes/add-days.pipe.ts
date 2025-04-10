import { PipeTransform, Pipe } from "@angular/core";
import { UtilsService } from "@core/services/utils/utils.service";

@Pipe({
  name: "addDays"
})
export class AddDaysPipe implements PipeTransform {
  transform(value: Date | string, days: number): Date {
    let date: Date;

    // Convert string to Date if necessary
    if (UtilsService.isString(value)) {
      date = new Date(value);
    } else {
      date = value as Date;
    }

    // Ensure the date is in UTC by creating a new Date object using UTC methods
    const utcDate = new Date(
      Date.UTC(
        date.getUTCFullYear(),
        date.getUTCMonth(),
        date.getUTCDate(),
        date.getUTCHours(),
        date.getUTCMinutes(),
        date.getUTCSeconds(),
        date.getUTCMilliseconds()
      )
    );

    // Add the specified number of days to the date
    utcDate.setUTCDate(utcDate.getUTCDate() + days);

    return utcDate;
  }
}
