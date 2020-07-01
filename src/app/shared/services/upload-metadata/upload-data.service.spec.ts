import { TestBed } from "@angular/core/testing";

import { skip } from "rxjs/operators";
import { UploadDataService, UploadMetadataEventInterface } from "./upload-data.service";

describe("UploadMetadataService", () => {
  let service: UploadDataService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(UploadDataService);
  });

  it("should be created", () => {
    expect(service).toBeTruthy();
  });

  describe("setMetadata", () => {
    it("should emit metadata change", done => {
      const event: UploadMetadataEventInterface = {
        id: "foo",
        metadata: {
          bar: 99
        }
      };

      service.metadataChanges$.pipe(skip(1)).subscribe(value => {
        expect(value).toEqual(event);
        done();
      });

      service.setMetadata(event.id, event.metadata);
    });
  });
});
