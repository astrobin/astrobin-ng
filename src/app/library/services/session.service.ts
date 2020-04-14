import { Injectable } from "@angular/core";

@Injectable({
  providedIn: "root"
})
export class SessionService {
  private readonly _storage: any = {};

  public get(key: string): any {
    return this._storage[key];
  }

  public put(key: string, data: any): void {
    this._storage[key] = data;
  }

  public delete(key: string): void {
    delete this._storage[key];
  }
}
