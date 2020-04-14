import { PermissionInterface } from "@lib/interfaces/permission.interface";

export interface GroupInterface {
  id: number;
  name: string;
  permissions?: PermissionInterface[];
}
