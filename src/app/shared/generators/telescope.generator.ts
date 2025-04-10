import type { TelescopeInterface } from "@core/interfaces/telescope.interface";

export class TelescopeGenerator {
  static telescope(): TelescopeInterface {
    return {
      pk: 1,
      make: "Some brand",
      name: "Some model"
    };
  }
}
