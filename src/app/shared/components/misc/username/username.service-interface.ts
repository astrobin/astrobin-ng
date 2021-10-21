import { UserInterface } from "@shared/interfaces/user.interface";
import { Observable } from "rxjs";

export interface UsernameServiceInterface {
  getDisplayName$(user: UserInterface): Observable<string>;
}
