import { Pipe, PipeTransform } from "@angular/core";
import { WeightUnit } from "@shared/types/weight-unit.enum";
import { UserProfileInterface } from "@shared/interfaces/user-profile.interface";

@Pipe({
  name: "preferredUserWeightUnit"
})
export class PreferredUserWeightUnitPipe implements PipeTransform {
  transform(userProfile: UserProfileInterface): WeightUnit {
    if (["us", "lr", "mm"].indexOf(userProfile.lastSeenInCountry) > -1) {
      return WeightUnit.LBS;
    }

    return WeightUnit.LBS;
  }
}
