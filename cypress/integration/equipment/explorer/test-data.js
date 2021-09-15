export const testBrand = {
  id: 1,
  deleted: null,
  created: "2021-09-12T08:09:23.625390",
  updated: "2021-09-12T08:09:23.625437",
  name: "Test brand",
  website: "https://www.test-brand.com",
  logo: null,
  createdBy: 1
};

export const testSensor = {
  id: 1,
  deleted: null,
  reviewedTimestamp: null,
  reviewerDecision: null,
  reviewerRejectionReason: null,
  reviewerComment: null,
  created: "2021-09-14T10:56:10.388669",
  updated: "2021-09-14T10:56:10.388688",
  name: "Test sensor",
  image: null,
  quantumEfficiency: null,
  pixelSize: null,
  pixelWidth: null,
  pixelHeight: null,
  sensorWidth: null,
  sensorHeight: null,
  fullWellCapacity: null,
  readNoise: null,
  frameRate: null,
  adc: null,
  colorOrMono: null,
  createdBy: 1,
  reviewedBy: null,
  brand: 1
};

export const testCamera = {
  id: 1,
  deleted: null,
  reviewedTimestamp: null,
  reviewerDecision: null,
  reviewerRejectionReason: null,
  reviewerComment: null,
  created: "2021-09-12T08:09:58.508643",
  updated: "2021-09-12T08:09:58.508679",
  name: "Test",
  image: null,
  type: "DEDICATED_DEEP_SKY",
  cooled: true,
  maxCooling: null,
  backFocus: null,
  createdBy: 1,
  reviewedBy: null,
  brand: 1,
  sensor: 1
};
