import { UserInterface } from "@shared/interfaces/user.interface";
import { GroupInterface } from "@shared/interfaces/group.interface";
import { Observable } from "rxjs";
import { map } from "rxjs/operators";

export function isGroupMember(
  groupName: GroupInterface["name"]
): (source$: Observable<UserInterface>) => Observable<boolean> {
  return source$ => source$.pipe(map(user => user.groups.filter(group => group.name === groupName).length > 0));
}
