import { Injectable } from "@angular/core";
import { LoadingServiceInterface } from "@shared/services/loading.service-interface";

@Injectable({
  providedIn: "root"
})
export class LoadingService implements LoadingServiceInterface {
  private _isLoading = false;

  isLoading(): boolean {
    return this._isLoading;
  }

  setLoading(value: boolean): void {
    this._isLoading = value;
  }
}
