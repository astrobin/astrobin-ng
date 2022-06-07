import { Pipe, PipeTransform } from "@angular/core";
import { WeightUnit } from "@shared/types/weight-unit.enum";

@Pipe({
  name: "weightUnitLabel"
})
export class WeightUnitLabelPipe implements PipeTransform {
  transform(label: string, unit: WeightUnit): unknown {
    if (unit === WeightUnit.KG) {
      return label.replace(WeightUnit.LBS, WeightUnit.KG);
    }

    return label.replace(WeightUnit.KG, WeightUnit.LBS);
  }
}
