import { Pipe, PipeTransform } from "@angular/core";

@Pipe({
  name: "numberSuffix"
})
export class NumberSuffixPipe implements PipeTransform {

  transform(value: number): string {
    if (value === null || value === undefined) {
      return null;
    }

    const isNegative = value < 0;
    const absValue = Math.abs(value);

    // Less than a thousand
    if (absValue < 1000) {
      return value.toString();
    }

    // Thousands
    if (absValue >= 1000 && absValue < 1000000) {
      const result = (absValue / 1000).toFixed(1);
      return (result === "1000.0" ? (isNegative ? "-1M" : "1M") : (isNegative ? "-" : "") + result.replace(/\.0$/, "") + "k");
    }

    // Millions
    if (absValue >= 1000000 && absValue < 1000000000) {
      const result = (absValue / 1000000).toFixed(1);
      return (result === "1000.0" ? (isNegative ? "-1B" : "1B") : (isNegative ? "-" : "") + result.replace(/\.0$/, "") + "M");
    }

    // Billions
    if (absValue >= 1000000000) {
      return (isNegative ? "-" : "") + (absValue / 1000000000).toFixed(1).replace(/\.0$/, "") + "B";
    }

    return value.toString(); // Fallback
  }
}
