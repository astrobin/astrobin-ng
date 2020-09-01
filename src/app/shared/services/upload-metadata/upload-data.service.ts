import { Injectable } from "@angular/core";
import { environment } from "@env/environment";
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
  endpointChanges$: Observable<string>;

  private _metadata: { [key: string]: UploadMetadataInterface } = {};

  private _metadataChanges = new BehaviorSubject<UploadMetadataEventInterface>(null);

  private _endpointChanges = new BehaviorSubject<string>(`${environment.classicBaseUrl}/api/v2/images/image/`);

  constructor() {
    this.metadataChanges$ = this._metadataChanges.asObservable();
    this.endpointChanges$ = this._endpointChanges.asObservable();
  }

  setMetadata(id: string, metadata: UploadMetadataInterface): void {
    this._metadata[id] = metadata;
    this._metadataChanges.next({ id, metadata });
  }

  patchMetadata(id: string, metadata: UploadMetadataInterface): void {
    this._metadata[id] = {
      ...this._metadata[id],
      ...metadata
    };
    this._metadataChanges.next({ id, metadata: this._metadata[id] });
  }

  setEndpoint(endpoint: string) {
    this._endpointChanges.next(endpoint);
  }
}
