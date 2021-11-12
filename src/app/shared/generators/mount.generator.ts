import { MountInterface } from "@shared/interfaces/mount.interface";

export class MountGenerator {
  static mount(): MountInterface {
    return {
      pk: 1,
      make: "Some brand",
      name: "Some model",
      max_payload: null,
      pe: null
    };
  }
}
