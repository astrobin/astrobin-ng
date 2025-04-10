import { AccessoryInterface } from "@core/interfaces/accessory.interface";

export class AccessoryGenerator {
  static accessory(): AccessoryInterface {
    return {
      pk: 1,
      make: "Some brand",
      name: "Some model"
    };
  }
}
