import type { UserInterface } from "@core/interfaces/user.interface";
import type { Observable } from "rxjs";

export interface UsernameServiceInterface {
  getDisplayName$(user: UserInterface): Observable<string>;
}
