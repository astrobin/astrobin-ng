import { FilterInterface } from "@shared/interfaces/filter.interface";

export class FilterGenerator {
  static filter(): FilterInterface {
    return {
      pk: 1,
      make: "Some brand",
      name: "Some model",
      type: "CLEAR_OR_COLOR",
      bandwidth: null
    };
  }
}
