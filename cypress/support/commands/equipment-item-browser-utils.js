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
  klass: "SENSOR",
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
  brand: 1,
  brandName: "Test brand",
  variantOf: null,
  variants: []
};

export const testCamera = {
  id: 1,
  deleted: null,
  klass: "CAMERA",
  reviewedTimestamp: null,
  reviewerDecision: null,
  reviewerRejectionReason: null,
  reviewerComment: null,
  created: "2021-09-12T08:09:58.508643",
  updated: "2021-09-12T08:09:58.508679",
  brand: 1,
  brandName: "Test brand",
  name: "Test camera",
  image: null,
  type: "DEDICATED_DEEP_SKY",
  cooled: true,
  maxCooling: 20,
  backFocus: 30,
  createdBy: 1,
  reviewedBy: null,
  sensor: 1,
  variantOf: null,
  variants: []
};

export const testTelescope = {
  id: 1,
  deleted: null,
  klass: "TELESCOPE",
  reviewedTimestamp: null,
  reviewerDecision: null,
  reviewerRejectionReason: null,
  reviewerComment: null,
  created: "2021-09-12T08:09:58.508643",
  updated: "2021-09-12T08:09:58.508679",
  brand: 1,
  brandName: "Test brand",
  name: "Test telescope",
  image: null,
  type: "REFRACTOR_ACHROMATIC",
  aperture: 80,
  minFocalLength: 600,
  maxFocalLength: 600,
  weight: 2,
  variantOf: null,
  variants: []
};

export const testMount = {
  id: 1,
  deleted: null,
  klass: "MOUNT",
  reviewedTimestamp: null,
  reviewerDecision: null,
  reviewerRejectionReason: null,
  reviewerComment: null,
  created: "2021-09-12T08:09:58.508643",
  updated: "2021-09-12T08:09:58.508679",
  brand: 1,
  brandName: "Test brand",
  name: "Test mount",
  image: null,
  type: "GERMAN_EQUATORIAL",
  weight: 50,
  maxPayload: 80,
  variantOf: null,
  variants: []
};

export const testFilter = {
  id: 1,
  deleted: null,
  klass: "FILTER",
  reviewedTimestamp: null,
  reviewerDecision: null,
  reviewerRejectionReason: null,
  reviewerComment: null,
  created: "2021-09-12T08:09:58.508643",
  updated: "2021-09-12T08:09:58.508679",
  brand: 1,
  brandName: "Test brand",
  name: "Test filter",
  image: null,
  type: "L",
  bandwidth: 12,
  size: "ROUND_1_25_IN",
  variantOf: null,
  variants: []
};

export const testAccessory = {
  id: 1,
  deleted: null,
  klass: "ACCESSORY",
  reviewedTimestamp: null,
  reviewerDecision: null,
  reviewerRejectionReason: null,
  reviewerComment: null,
  created: "2021-09-12T08:09:58.508643",
  updated: "2021-09-12T08:09:58.508679",
  brand: 1,
  brandName: "Test brand",
  name: "Test accessory",
  image: null,
  variantOf: null,
  variants: []
};

export const testSoftware = {
  id: 1,
  deleted: null,
  klass: "SOFTWARE",
  reviewedTimestamp: null,
  reviewerDecision: null,
  reviewerRejectionReason: null,
  reviewerComment: null,
  created: "2021-09-12T08:09:58.508643",
  updated: "2021-09-12T08:09:58.508679",
  brand: 1,
  brandName: "Test brand",
  name: "Test software",
  image: null,
  variantOf: null,
  variants: []
};

export const testCameraEditProposal = {
  ...testCamera,
  ...{
    editProposalTarget: 1,
    editProposalBy: 1,
    editProposalCreated: "2021-09-13T00:00:00",
    editProposalUpdated: "2021-09-13T00:00:00",
    editProposalReviewStatus: null,
    name: "Test Pro"
  }
};

export const testTelescopeEditProposal = {
  ...testTelescope,
  ...{
    editProposalTarget: 1,
    editProposalBy: 1,
    editProposalCreated: "2021-09-13T00:00:00",
    editProposalUpdated: "2021-09-13T00:00:00",
    editProposalReviewStatus: null,
    name: "Test telescope Pro"
  }
};

export const testMountEditProposal = {
  ...testMount,
  ...{
    editProposalTarget: 1,
    editProposalBy: 1,
    editProposalCreated: "2021-09-13T00:00:00",
    editProposalUpdated: "2021-09-13T00:00:00",
    editProposalReviewStatus: null,
    name: "Test mount Pro"
  }
};

export const testFilterEditProposal = {
  ...testFilter,
  ...{
    editProposalTarget: 1,
    editProposalBy: 1,
    editProposalCreated: "2021-09-13T00:00:00",
    editProposalUpdated: "2021-09-13T00:00:00",
    editProposalReviewStatus: null,
    name: "Test filter Pro"
  }
};

export const testAccessoryEditProposal = {
  ...testAccessory,
  ...{
    editProposalTarget: 1,
    editProposalBy: 1,
    editProposalCreated: "2021-09-13T00:00:00",
    editProposalUpdated: "2021-09-13T00:00:00",
    editProposalReviewStatus: null,
    name: "Test accessory Pro"
  }
};

export const testSoftwareEditProposal = {
  ...testSoftware,
  ...{
    editProposalTarget: 1,
    editProposalBy: 1,
    editProposalCreated: "2021-09-13T00:00:00",
    editProposalUpdated: "2021-09-13T00:00:00",
    editProposalReviewStatus: null,
    name: "Test software Pro"
  }
};

Cypress.Commands.add("setupEquipmentDefaultRoutesForBrands", () => {
  cy.route("GET", "**/api/v2/equipment/brand/?page=*&sort=*", {
    count: 0,
    next: null,
    previous: null,
    results: []
  }).as("getAllBrands");

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

  cy.route("GET", /\/api\/v2\/equipment\/brand\/\?website=.*/, {
    count: 0,
    next: null,
    previous: null,
    results: []
  }).as("findBrandsByWebsite");

  cy.route("GET", /\/json-api\/common\/url-is-available\/\?url=.*/, { available: true });

  cy.route("GET", /\/api\/v2\/equipment\/brand\/\d+\/$/, testBrand).as("findBrandsByName");
});

Cypress.Commands.add("setupEquipmentDefaultRoutesForAllClasses", () => {
  cy.route("GET", "**/api/v2/equipment/**/users/", []).as("getUsers");
  cy.route("GET", "**/api/v2/equipment/**/images/", []).as("getImages");
  cy.route("GET", "**/api/v2/equipment/**/most-often-used-with/", []).as("getMostOftenUsedWith");
  cy.route("GET", "**/api/v2/nestedcomments/nestedcomments/**", []).as("getComments");

  cy.route("POST", "**/api/v2/equipment/**/acquire-review-lock/", {}).as("acquireReviewLock");
  cy.route("POST", "**/api/v2/equipment/**/release-review-lock/", {}).as("releaseReviewLock");
  cy.route("POST", "**/api/v2/equipment/**/acquire-edit-proposal-lock/", {}).as("acquireEditProposalLock");
  cy.route("POST", "**/api/v2/equipment/**/release-edit-proposal-lock/", {}).as("releaseEditProposalLock");
  cy.route("POST", "**/api/v2/equipment/**/acquire-edit-proposal-review-lock/", {}).as("acquireEditProposalReviewLock");
  cy.route("POST", "**/api/v2/equipment/**/release-edit-proposal-review-lock/", {}).as("releaseEditProposalReviewLock");

  cy.route("GET", "**/api/v2/equipment/contributors/", []).as("getContributors");
});

Cypress.Commands.add("setupEquipmentDefaultRoutesForCameras", () => {
  cy.route("GET", "**/api/v2/equipment/camera/?page=*", {
    count: 1,
    next: null,
    previous: null,
    results: [testCamera]
  }).as("findCameras");

  cy.route("GET", "**/api/v2/equipment/camera/find-similar-in-brand/*", []);

  cy.route("GET", "**/api/v2/equipment/camera/others-in-brand/*", []);

  cy.route("GET", "**/api/v2/equipment/camera/?brand=*", {
    count: 0,
    next: null,
    previous: null,
    results: []
  }).as("findCamerasByName");

  cy.route("GET", "**/api/v2/equipment/camera/?pending_review=true&page=*", {
    count: 0,
    next: null,
    previous: null,
    results: []
  }).as("findCamerasPendingReview");

  cy.route("GET", "**/api/v2/equipment/camera/?pending_edit=true?page=*", {
    count: 0,
    next: null,
    previous: null,
    results: []
  }).as("findCamerasPendingEdit");

  cy.route("GET", "**/api/v2/equipment/camera-edit-proposal/?edit_proposal_target=*", {
    results: []
  }).as("getEditProposals");

  cy.route("GET", "**/api/v2/common/contenttypes/**", [
    {
      id: 1,
      appLabel: "astrobin_apps_equipment",
      model: "camera"
    }
  ]).as("getContentType");
});

Cypress.Commands.add("setupEquipmentDefaultRoutesForSensors", () => {
  cy.route("GET", /\/api\/v2\/equipment\/sensor\/\d+\/$/, testSensor).as("getSensor");
  cy.route("GET", "**/api/v2/equipment/sensor/?brand=*", { count: 0, results: [] }).as("findSensorsByName");
  cy.route("GET", "**/api/v2/equipment/sensor/?page=*", {
    count: 1,
    next: null,
    previous: null,
    results: [testSensor]
  }).as("findSensors");
  cy.route("GET", "**/api/v2/equipment/sensor/find-similar-in-brand/*", []).as("findSimilarSensors");
  cy.route("GET", "**/api/v2/equipment/sensor/others-in-brand/*", [testSensor]).as("sensorOthersInBrand");

  cy.route("GET", "**/api/v2/common/contenttypes/**", [
    {
      id: 1,
      appLabel: "astrobin_apps_equipment",
      model: "sensor"
    }
  ]).as("getContentType");
});

Cypress.Commands.add("setupEquipmentDefaultRoutesForTelescopes", () => {
  cy.route("GET", "**/api/v2/equipment/telescope/?page=*", {
    count: 1,
    next: null,
    previous: null,
    results: [testTelescope]
  }).as("findTelescopes");

  cy.route("GET", "**/api/v2/equipment/telescope/find-similar-in-brand/*", []);

  cy.route("GET", "**/api/v2/equipment/telescope/others-in-brand/*", []);

  cy.route("GET", "**/api/v2/equipment/telescope/?brand=*", {
    count: 0,
    next: null,
    previous: null,
    results: []
  }).as("findTelescopesByName");

  cy.route("GET", "**/api/v2/equipment/telescope/?pending_review=true&page=*", {
    count: 0,
    next: null,
    previous: null,
    results: []
  }).as("findTelescopesPendingReview");

  cy.route("GET", "**/api/v2/equipment/telescope/?pending_edit=true?page=*", {
    count: 0,
    next: null,
    previous: null,
    results: []
  }).as("findTelescopesPendingEdit");

  cy.route("GET", "**/api/v2/equipment/telescope-edit-proposal/?edit_proposal_target=*", {
    results: []
  }).as("getEditProposals");

  cy.route("GET", "**/api/v2/common/contenttypes/**", [
    {
      id: 1,
      appLabel: "astrobin_apps_equipment",
      model: "telescope"
    }
  ]).as("getContentType");
});

Cypress.Commands.add("setupEquipmentDefaultRoutesForMounts", () => {
  cy.route("GET", "**/api/v2/equipment/mount/?page=*", {
    count: 1,
    next: null,
    previous: null,
    results: [testMount]
  }).as("findMounts");

  cy.route("GET", "**/api/v2/equipment/mount/find-similar-in-brand/*", []);

  cy.route("GET", "**/api/v2/equipment/mount/others-in-brand/*", []);

  cy.route("GET", "**/api/v2/equipment/mount/?brand=*", {
    count: 0,
    next: null,
    previous: null,
    results: []
  }).as("findMountsByName");

  cy.route("GET", "**/api/v2/equipment/mount/?pending_review=true&page=*", {
    count: 0,
    next: null,
    previous: null,
    results: []
  }).as("findMountsPendingReview");

  cy.route("GET", "**/api/v2/equipment/mount/?pending_edit=true?page=*", {
    count: 0,
    next: null,
    previous: null,
    results: []
  }).as("findMountsPendingEdit");

  cy.route("GET", "**/api/v2/equipment/mount-edit-proposal/?edit_proposal_target=*", {
    results: []
  }).as("getEditProposals");

  cy.route("GET", "**/api/v2/common/contenttypes/**", [
    {
      id: 1,
      appLabel: "astrobin_apps_equipment",
      model: "mount"
    }
  ]).as("getContentType");
});

Cypress.Commands.add("setupEquipmentDefaultRoutesForFilters", () => {
  cy.route("GET", "**/api/v2/equipment/filter/?page=*", {
    count: 1,
    next: null,
    previous: null,
    results: [testFilter]
  }).as("findFilters");

  cy.route("GET", "**/api/v2/equipment/filter/find-similar-in-brand/*", []);

  cy.route("GET", "**/api/v2/equipment/filter/others-in-brand/*", []);

  cy.route("GET", "**/api/v2/equipment/filter/?brand=*", {
    count: 0,
    next: null,
    previous: null,
    results: []
  }).as("findFiltersByName");

  cy.route("GET", "**/api/v2/equipment/filter/?pending_review=true&page=*", {
    count: 0,
    next: null,
    previous: null,
    results: []
  }).as("findFiltersPendingReview");

  cy.route("GET", "**/api/v2/equipment/filter/?pending_edit=true?page=*", {
    count: 0,
    next: null,
    previous: null,
    results: []
  }).as("findFiltersPendingEdit");

  cy.route("GET", "**/api/v2/equipment/filter-edit-proposal/?edit_proposal_target=*", {
    results: []
  }).as("getEditProposals");

  cy.route("GET", "**/api/v2/common/contenttypes/**", [
    {
      id: 1,
      appLabel: "astrobin_apps_equipment",
      model: "filter"
    }
  ]).as("getContentType");
});

Cypress.Commands.add("setupEquipmentDefaultRoutesForAccessories", () => {
  cy.route("GET", "**/api/v2/equipment/accessory/?page=*", {
    count: 1,
    next: null,
    previous: null,
    results: [testAccessory]
  }).as("findAccessories");

  cy.route("GET", "**/api/v2/equipment/accessory/find-similar-in-brand/*", []);

  cy.route("GET", "**/api/v2/equipment/accessory/others-in-brand/*", []);

  cy.route("GET", "**/api/v2/equipment/accessory/?brand=*", {
    count: 0,
    next: null,
    previous: null,
    results: []
  }).as("findAccessoriesByName");

  cy.route("GET", "**/api/v2/equipment/accessory/?pending_review=true&page=*", {
    count: 0,
    next: null,
    previous: null,
    results: []
  }).as("findAccessoriesPendingReview");

  cy.route("GET", "**/api/v2/equipment/accessory/?pending_edit=true?page=*", {
    count: 0,
    next: null,
    previous: null,
    results: []
  }).as("findAccessoriesPendingEdit");

  cy.route("GET", "**/api/v2/equipment/accessory-edit-proposal/?edit_proposal_target=*", {
    results: []
  }).as("getEditProposals");

  cy.route("GET", "**/api/v2/common/contenttypes/**", [
    {
      id: 1,
      appLabel: "astrobin_apps_equipment",
      model: "accessory"
    }
  ]).as("getContentType");
});

Cypress.Commands.add("setupEquipmentDefaultRoutesForSoftware", () => {
  cy.route("GET", "**/api/v2/equipment/software/?page=*", {
    count: 1,
    next: null,
    previous: null,
    results: [testSoftware]
  }).as("findSoftwareItems");

  cy.route("GET", "**/api/v2/equipment/software/find-similar-in-brand/*", []);

  cy.route("GET", "**/api/v2/equipment/software/others-in-brand/*", []);

  cy.route("GET", "**/api/v2/equipment/software/?brand=*", {
    count: 0,
    next: null,
    previous: null,
    results: []
  }).as("findSoftwareItemsByName");

  cy.route("GET", "**/api/v2/equipment/software/?pending_review=true&page=*", {
    count: 0,
    next: null,
    previous: null,
    results: []
  }).as("findSoftwareItemsPendingReview");

  cy.route("GET", "**/api/v2/equipment/software/?pending_edit=true?page=*", {
    count: 0,
    next: null,
    previous: null,
    results: []
  }).as("findSoftwareItemsPendingEdit");

  cy.route("GET", "**/api/v2/equipment/software-edit-proposal/?edit_proposal_target=*", {
    results: []
  }).as("getEditProposals");

  cy.route("GET", "**/api/v2/common/contenttypes/**", [
    {
      id: 1,
      appLabel: "astrobin_apps_equipment",
      model: "software"
    }
  ]).as("getContentType");
});

Cypress.Commands.add("setupEquipmentDefaultRoutes", () => {
  cy.setupEquipmentDefaultRoutesForBrands();
  cy.setupEquipmentDefaultRoutesForAllClasses();
  cy.setupEquipmentDefaultRoutesForCameras();
  cy.setupEquipmentDefaultRoutesForSensors();
  cy.setupEquipmentDefaultRoutesForTelescopes();
  cy.setupEquipmentDefaultRoutesForMounts();
  cy.setupEquipmentDefaultRoutesForFilters();
  cy.setupEquipmentDefaultRoutesForAccessories();
  cy.setupEquipmentDefaultRoutesForSoftware();
});

Cypress.Commands.add("equipmentItemBrowserCreate", (selector, text, apiToWait) => {
  cy.get(`${selector} + .toggle-enable-fullscreen`).click();

  cy.ngSelectType(selector, text);

  cy.wait(apiToWait);

  cy.get(`${selector} .add-tag .btn`).click();
});

Cypress.Commands.add("equipmentItemBrowserCreateBrand", (selector, name, website, brandObject) => {
  cy.equipmentItemBrowserCreate(selector, name, "@findBrands");

  cy.get("#brand-field-name").should("have.value", name);

  cy.get("#brand-field-website").click();

  cy.get("#brand-field-website").type("-invalid-website-");
  cy.get("#brand-field-name").click();
  cy.get("formly-validation-message")
    .contains("This does not look like a valid URL.")
    .should("be.visible");

  cy.route("GET", /\/json-api\/common\/url-is-available\/\?url=.*/, { available: false });
  cy.get("#brand-field-website")
    .clear()
    .type("www.does-not-exist.com");
  cy.get("#brand-field-name").click();
  cy.get("formly-validation-message")
    .contains("AstroBin could not connect to this server.")
    .should("be.visible");

  cy.route("GET", /\/json-api\/common\/url-is-available\/\?url=.*/, { available: true });
  cy.get("#brand-field-website")
    .clear()
    .type(website);

  cy.route("post", "**/api/v2/equipment/brand/", brandObject).as("createBrand");
  cy.route("GET", "**/api/v2/equipment/brand/1/", brandObject);

  cy.get("#create-new-brand .btn-primary").click();

  cy.wait("@createBrand");

  cy.ngSelectValueShouldContain(selector, name);
});

Cypress.Commands.add("equipmentItemBrowserCreateBrandUsingSuggestion", (selector, name, brandObject) => {
  cy.equipmentItemBrowserCreate(selector, name, "@findBrands");

  cy.route("GET", "**/api/v2/equipment/brand/?q=*", { count: 1, results: [brandObject] }).as("findBrands");

  cy.get("#brand-field-name").click();
  cy.get("#brand-field-name").clear();
  cy.get("#brand-field-name").type(name);

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

  cy.get(`${selector} + .toggle-enable-fullscreen`).click();

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

  cy.get(`${selector} + .toggle-enable-fullscreen`).click();

  cy.ngSelectType(selector, cameraName);

  cy.wait("@findCameras");

  cy.ngSelectOptionNumberSelectorShouldContain(selector, 1, "astrobin-equipment-item-display-name .name", cameraName);
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

  cy.get(`${selector} + .toggle-enable-fullscreen`).click();

  cy.ngSelectType(selector, sensorName);

  cy.wait("@findSensors");

  cy.ngSelectOptionNumberSelectorShouldContain(selector, 1, "astrobin-equipment-item-display-name .name", sensorName);
  cy.ngSelectOptionClick(selector, 1);
  cy.ngSelectValueShouldContain(selector, sensorName);
});

Cypress.Commands.add("equipmentItemBrowserSelectFirstTelescope", (selector, telescopeName, telescopeObject) => {
  cy.route("GET", "**/api/v2/equipment/telescope/?q=*", {
    count: 1,
    next: null,
    previous: null,
    results: [telescopeObject]
  }).as("findTelescopes");

  cy.get(`${selector} + .toggle-enable-fullscreen`).click();

  cy.ngSelectType(selector, telescopeName);

  cy.wait("@findTelescopes");

  cy.ngSelectOptionNumberSelectorShouldContain(
    selector,
    1,
    "astrobin-equipment-item-display-name .name",
    telescopeName
  );
  cy.ngSelectOptionClick(selector, 1);
  cy.ngSelectValueShouldContain(selector, telescopeName);
});

Cypress.Commands.add("equipmentItemBrowserSelectFirstMount", (selector, mountName, mountObject) => {
  cy.route("GET", "**/api/v2/equipment/mount/?q=*", {
    count: 1,
    next: null,
    previous: null,
    results: [mountObject]
  }).as("findMounts");

  cy.get(`${selector} + .toggle-enable-fullscreen`).click();

  cy.ngSelectType(selector, mountName);

  cy.wait("@findMounts");

  cy.ngSelectOptionNumberSelectorShouldContain(selector, 1, "astrobin-equipment-item-display-name .name", mountName);
  cy.ngSelectOptionClick(selector, 1);
  cy.ngSelectValueShouldContain(selector, mountName);
});

Cypress.Commands.add("equipmentItemBrowserSelectFirstFilter", (selector, filterName, filterObject) => {
  cy.route("GET", "**/api/v2/equipment/filter/?q=*", {
    count: 1,
    next: null,
    previous: null,
    results: [filterObject]
  }).as("findFilters");

  cy.get(`${selector} + .toggle-enable-fullscreen`).click();

  cy.ngSelectType(selector, filterName);

  cy.wait("@findFilters");

  cy.ngSelectOptionNumberSelectorShouldContain(selector, 1, "astrobin-equipment-item-display-name .name", filterName);
  cy.ngSelectOptionClick(selector, 1);
  cy.ngSelectValueShouldContain(selector, filterName);
});

Cypress.Commands.add("equipmentItemBrowserSelectFirstAccessory", (selector, accessoryName, accessoryObject) => {
  cy.route("GET", "**/api/v2/equipment/accessory/.*", {
    count: 1,
    next: null,
    previous: null,
    results: [accessoryObject]
  }).as("findAccessories");

  cy.get(`${selector} + .toggle-enable-fullscreen`).click();

  cy.ngSelectType(selector, accessoryName);

  cy.wait("@findAccessories");

  cy.ngSelectOptionNumberSelectorShouldContain(
    selector,
    1,
    "astrobin-equipment-item-display-name .name",
    accessoryName
  );
  cy.ngSelectOptionClick(selector, 1);
  cy.ngSelectValueShouldContain(selector, accessoryName);
});

Cypress.Commands.add("equipmentItemBrowserSelectFirstSoftware", (selector, softwareName, softwareObject) => {
  cy.route("GET", "**/api/v2/equipment/software/?q=*", {
    count: 1,
    next: null,
    previous: null,
    results: [softwareObject]
  }).as("findSoftwareItems");

  cy.get(`${selector} + .toggle-enable-fullscreen`).click();

  cy.ngSelectType(selector, softwareName);

  cy.wait("@findSoftwareItems");

  cy.ngSelectOptionNumberSelectorShouldContain(selector, 1, "astrobin-equipment-item-display-name .name", softwareName);
  cy.ngSelectOptionClick(selector, 1);
  cy.ngSelectValueShouldContain(selector, softwareName);
});

Cypress.Commands.add("equipmentItemBrowserShouldContain", (selector, brandName, itemName) => {
  cy.get(`${selector} .ng-value .brand`).should("contain", brandName);
  cy.get(`${selector} .ng-value .name`).should("contain", itemName);
});
