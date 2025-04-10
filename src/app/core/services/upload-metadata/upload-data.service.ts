import { Injectable } from "@angular/core";
import { UploadDataServiceInterface } from "@core/services/upload-metadata/upload-data.service-interface";
import { environment } from "@env/environment";
import { TranslateService } from "@ngx-translate/core";
import { Constants } from "@shared/constants";
import { Observable, BehaviorSubject, Subject } from "rxjs";

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
  allowedTypesChanges$: Observable<{
    allowedTypes: string;
    uploadLabel: string;
  }>;

  private _metadata: { [key: string]: UploadMetadataInterface } = {};

  private _metadataChanges = new BehaviorSubject<UploadMetadataEventInterface>(null);

  private _endpointChanges = new BehaviorSubject<string>(`${environment.classicApiUrl}/api/v2/images/image-upload/`);

  private _allowedTypesChanges = new Subject<{
    allowedTypes: string;
    uploadLabel: string;
  }>();

  constructor(public readonly translateService: TranslateService) {
    this.metadataChanges$ = this._metadataChanges.asObservable();
    this.endpointChanges$ = this._endpointChanges.asObservable();
    this.allowedTypesChanges$ = this._allowedTypesChanges.asObservable();
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

  getUploadLabel(allowedTypes: string): string {
    const hasImageTypes = allowedTypes.indexOf(".jpg") > -1;
    const hasVideoTypes = allowedTypes.indexOf(".mp4") > -1;
    const hasUncompressedSourceTypes = allowedTypes.indexOf(".fits") > -1;

    if (hasImageTypes && hasVideoTypes && hasUncompressedSourceTypes) {
      return this.translateService.instant("Upload an image, a video, or an uncompressed source file");
    }

    if (hasImageTypes && hasVideoTypes) {
      return this.translateService.instant("Upload an image or a video");
    }

    if (hasImageTypes) {
      return this.translateService.instant("Upload an image");
    }

    return this.translateService.instant("Upload an uncompressed source file");
  }
}
