import { PipeTransform, Pipe } from "@angular/core";

@Pipe({
  name: "localDate"
})
export class LocalDatePipe implements PipeTransform {
  transform(value: string): Date {
    if (value.indexOf("T") !== -1 && value.charAt(value.length - 1) !== "Z") {
      value += "Z";
    }

    return new Date(value);
  }
}
