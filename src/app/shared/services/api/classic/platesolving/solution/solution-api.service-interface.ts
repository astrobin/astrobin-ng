import { SolutionInterface } from "@shared/interfaces/solution.interface";
import { Observable } from "rxjs";

export interface SolutionApiServiceInterface {
  getSolution(contentType: number, objectId: string): Observable<SolutionInterface>;
}
