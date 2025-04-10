import type { PermissionInterface } from "@core/interfaces/permission.interface";

export interface AuthGroupInterface {
  id: number;
  name: string;
  permissions?: PermissionInterface[];
}
