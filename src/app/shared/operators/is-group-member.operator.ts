import type { GroupInterface } from "@core/interfaces/group.interface";
import type { UserInterface } from "@core/interfaces/user.interface";
import type { Observable } from "rxjs";
import { map } from "rxjs/operators";

export function isGroupMember(
  groupName: GroupInterface["name"]
): (source$: Observable<UserInterface>) => Observable<boolean> {
  return source$ => source$.pipe(map(user => user.groups.filter(group => group.name === groupName).length > 0));
}
