import { UserInterface } from "@core/interfaces/user.interface";
import { Observable } from "rxjs";

export interface UsernameServiceInterface {
  getDisplayName$(user: UserInterface): Observable<string>;
}
