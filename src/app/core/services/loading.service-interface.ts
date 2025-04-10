import type { Observable } from "rxjs";

export interface LoadingServiceInterface {
  isLoading: () => Observable<boolean>;
  setLoading: (boolean) => void;
}
