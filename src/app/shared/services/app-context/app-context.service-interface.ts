import { Observable } from "rxjs";
import { AppContextInterface } from "./app-context.service";

export interface AppContextServiceInterface {
  context$: Observable<AppContextInterface>;

  load(): Promise<any>;

  loadForUser(): Promise<any>;
}
