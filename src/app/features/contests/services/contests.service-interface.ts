import { ContestInterface } from "@features/contests/interfaces/contest.interface";
import { ListResponseInterface } from "@shared/interfaces/list-response.interface";
import { Observable } from "rxjs";

export interface ContestsServiceInterface {
  listRunning(): Observable<ListResponseInterface<ContestInterface>>;
}
