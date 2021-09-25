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
  maxCooling: 20,
  backFocus: 30,
  createdBy: 1,
  reviewedBy: null,
  brand: 1,
  sensor: 1
};

export const testCameraEditProposal = {
  ...testCamera,
  ...{
    editProposalTarget: 1,
    editProposalBy: 1,
    editProposalCreated: "2021-09-13T00:00:00",
    editProposalUpdated: "2021-09-13T00:00:00",
    name: "Test Pro"
  }
};

Cypress.Commands.add("setupEquipmentDefaultRoutes", () => {
  cy.route("GET", "**/api/v2/equipment/brand/?q=*", {
    count: 0,
    next: null,
    previous: null,
    results: []
  }).as("findBrands");

  cy.route("GET", "**/api/v2/equipment/brand/?name=*", {
    count: 0,
    next: null,
    previous: null,
    results: []
  }).as("findBrandsByName");

  cy.route("GET", /\/api\/v2\/equipment\/brand\/\d+\/$/, testBrand).as("findBrandsByName");

  cy.route("GET", "**/api/v2/equipment/camera/?q=*", {
    count: 1,
    next: null,
    previous: null,
    results: []
  }).as("findCameras");

  cy.route("GET", "**/api/v2/equipment/camera/", {
    count: 1,
    next: null,
    previous: null,
    results: [testCamera]
  }).as("getCameras");

  cy.route("GET", "**/api/v2/equipment/camera/?name=*", {
    count: 0,
    next: null,
    previous: null,
    results: []
  }).as("findCamerasByName");

  cy.route("GET", "**/api/v2/equipment/camera/?pending_review=true", {
    count: 0,
    next: null,
    previous: null,
    results: []
  }).as("findCamerasPendingReview");

  cy.route("GET", "**/api/v2/equipment/camera/?pending_edit=true", {
    count: 0,
    next: null,
    previous: null,
    results: []
  }).as("findCamerasPendingEdit");

  cy.route("GET", "**/api/v2/equipment/sensor/?q=*", {
    count: 0,
    next: null,
    previous: null,
    results: []
  }).as("findSensors");

  cy.route("GET", /\/api\/v2\/equipment\/sensor\/\d+\/$/, testSensor).as("getSensor");

  cy.route("GET", "**/api/v2/equipment/sensor/?name=*", { count: 1, results: [] }).as("findSensorsByName");
  cy.route("GET", "**/api/v2/equipment/sensor/others-in-brand/*", { count: 1, results: [testSensor] }).as(
    "sensorOthersInBrand"
  );

  cy.route("GET", "**/api/v2/equipment/telescope/", {
    count: 0,
    next: null,
    previous: null,
    results: []
  }).as("getTelescopes");

  cy.route("GET", "**/api/v2/equipment/mount/", {
    count: 0,
    next: null,
    previous: null,
    results: []
  }).as("getMounts");

  cy.route("GET", "**/api/v2/equipment/filter/", {
    count: 0,
    next: null,
    previous: null,
    results: []
  }).as("getFilters");

  cy.route("GET", "**/api/v2/equipment/accessory/", {
    count: 0,
    next: null,
    previous: null,
    results: []
  }).as("getAccessories");

  cy.route("GET", "**/api/v2/equipment/software/", {
    count: 0,
    next: null,
    previous: null,
    results: []
  }).as("getSoftware");
});

Cypress.Commands.add("equipmentItemBrowserCreate", (selector, text, apiToWait) => {
  cy.ngSelectType(selector, text);

  cy.wait(apiToWait);

  cy.ngSelectShouldHaveOptionsCount(selector, 1);
  cy.ngSelectOptionNumberSelectorShouldContain(selector, 1, "span span", "Create new");
  cy.ngSelectOptionNumberSelectorShouldContain(selector, 1, "span", text);
  cy.ngSelectOptionClick(selector, 1);
});

Cypress.Commands.add("equipmentItemBrowserCreateBrand", (selector, name, website, brandObject) => {
  cy.equipmentItemBrowserCreate(selector, name, "@findBrands");

  cy.get("#brand-field-name").should("have.value", name);
  cy.get("#brand-field-website").type(website);

  cy.route("POST", "**/api/v2/equipment/brand/", brandObject).as("createBrand");
  cy.route("GET", "**/api/v2/equipment/brand/1/", brandObject);

  cy.get("#create-new-brand .btn-primary").click();

  cy.wait("@createBrand");

  cy.ngSelectValueShouldContain(selector, name);
});

Cypress.Commands.add("equipmentItemBrowserCreateBrandUsingSuggestion", (selector, name, brandObject) => {
  cy.equipmentItemBrowserCreate(selector, name, "@findBrands");

  cy.route("GET", "**/api/v2/equipment/brand/?q=*", { count: 1, results: [brandObject] }).as("findBrands");

  cy.get("#brand-field-name").clear();
  cy.get("#brand-field-name").type("Test band");

  cy.wait("@findBrands");

  cy.get("astrobin-similar-items-suggestion").should("be.visible");
  cy.get("astrobin-similar-items-suggestion .btn").click();

  cy.route("GET", "**/api/v2/equipment/brand/1/", brandObject);

  cy.ngSelectValueShouldContain(selector, name);
});

Cypress.Commands.add("equipmentItemBrowserSelectFirstBrand", (selector, brandName, brandObject) => {
  cy.route("GET", "**/api/v2/equipment/brand/?q=*", {
    count: 1,
    next: null,
    previous: null,
    results: [brandObject]
  }).as("findBrands");

  cy.ngSelectType(selector, brandName);

  cy.wait("@findBrands");

  cy.ngSelectOptionNumberSelectorShouldContain(selector, 1, "astrobin-brand-summary .label", brandName);
  cy.ngSelectOptionClick(selector, 1);
  cy.ngSelectValueShouldContain(selector, brandName);
});

Cypress.Commands.add("equipmentItemBrowserSelectFirstCamera", (selector, cameraName, cameraObject) => {
  cy.route("GET", "**/api/v2/equipment/camera/?q=*", {
    count: 1,
    next: null,
    previous: null,
    results: [cameraObject]
  }).as("findCameras");

  cy.ngSelectType(selector, cameraName);

  cy.wait("@findCameras");

  cy.ngSelectOptionNumberSelectorShouldContain(selector, 1, "astrobin-equipment-item-summary .label", cameraName);
  cy.ngSelectOptionClick(selector, 1);
  cy.ngSelectValueShouldContain(selector, cameraName);
});

Cypress.Commands.add("equipmentItemBrowserSelectFirstSensor", (selector, sensorName, sensorObject) => {
  cy.route("GET", "**/api/v2/equipment/sensor/?q=*", {
    count: 1,
    next: null,
    previous: null,
    results: [sensorObject]
  }).as("findSensors");

  cy.ngSelectType(selector, sensorName);

  cy.wait("@findSensors");

  cy.ngSelectOptionNumberSelectorShouldContain(selector, 1, "astrobin-equipment-item-summary .label", sensorName);
  cy.ngSelectOptionClick(selector, 1);
  cy.ngSelectValueShouldContain(selector, sensorName);
});
