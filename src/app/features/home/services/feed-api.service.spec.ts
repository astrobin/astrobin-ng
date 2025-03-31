import { TestBed } from '@angular/core/testing';

import { FeedApiService } from './feed-api.service';
import { AppModule } from "@app/app.module";
import { MockBuilder } from "ng-mocks";
import { HttpClientModule } from "@angular/common/http";
import { HttpClientTestingModule } from "@angular/common/http/testing";

describe('FeedApiService', () => {
  let service: FeedApiService;

  beforeEach(async() => {
    await MockBuilder(FeedApiService, AppModule).replace(HttpClientModule, HttpClientTestingModule);
    service = TestBed.inject(FeedApiService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
