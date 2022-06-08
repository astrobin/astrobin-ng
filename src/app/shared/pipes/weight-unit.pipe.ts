import { Pipe, PipeTransform } from "@angular/core";
import { WeightUnit } from "@shared/types/weight-unit.enum";
import { Constants } from "@shared/constants";

@Pipe({
  name: "weightUnit"
})
export class WeightUnitPipe implements PipeTransform {
  transform(value: number, unit: WeightUnit): unknown {
    if (unit === WeightUnit.KG) {
      return value;
    }

    return (value * Constants.KG_TO_LBS).toFixed(2);
  }
}
