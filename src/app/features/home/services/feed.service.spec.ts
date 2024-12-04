import { TestBed } from '@angular/core/testing';

import { FeedService } from './feed.service';
import { AppModule } from "@app/app.module";
import { MockBuilder } from "ng-mocks";

describe('FeedService', () => {
  let service: FeedService;

  beforeEach(async () => {
    await MockBuilder(FeedService, AppModule);
    service = TestBed.inject(FeedService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
