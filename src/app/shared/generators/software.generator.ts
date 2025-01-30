import { SoftwareInterface } from "@core/interfaces/software.interface";

export class SoftwareGenerator {
  static software(): SoftwareInterface {
    return {
      pk: 1,
      make: "Some brand",
      name: "Some model"
    };
  }
}
