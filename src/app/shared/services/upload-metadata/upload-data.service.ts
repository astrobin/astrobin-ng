import { Injectable } from "@angular/core";
import { UploadDataServiceInterface } from "@shared/services/upload-metadata/upload-data.service-interface";
import { BehaviorSubject, Observable } from "rxjs";

export interface UploadMetadataInterface {
  [key: string]: any;
}

export interface UploadMetadataEventInterface {
  id: string;
  metadata: UploadMetadataInterface;
}

@Injectable({
  providedIn: "root"
})
export class UploadDataService implements UploadDataServiceInterface {
  metadataChanges$: Observable<UploadMetadataEventInterface>;

  private _metadata = {};

  private _metadataChanges = new BehaviorSubject<UploadMetadataEventInterface>(null);

  constructor() {
    this.metadataChanges$ = this._metadataChanges.asObservable();
  }

  setMetadata(id: string, metadata: UploadMetadataInterface): void {
    this._metadata[id] = metadata;
    this._metadataChanges.next({ id, metadata });
  }
}
