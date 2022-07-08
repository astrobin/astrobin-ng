const testEquipmentPreset = {
  id: 1,
  deleted: null,
  created: "2021-12-04T11:43:49.372996",
  updated: "2021-12-04T19:14:42.047104",
  remoteSource: null,
  name: "Test preset",
  user: 1,
  imagingTelescopes: [1, 2],
  guidingTelescopes: [3],
  imagingCameras: [1, 2],
  guidingCameras: [3],
  mounts: [1],
  filters: [1],
  accessories: [1],
  software: [1]
};

const testEquipmentPreset2 = {
  id: 2,
  deleted: null,
  created: "2021-12-04T11:43:49.372996",
  updated: "2021-12-04T19:14:42.047104",
  remoteSource: null,
  name: "Test preset 2",
  user: 1,
  imagingTelescopes: [4],
  guidingTelescopes: [],
  imagingCameras: [],
  guidingCameras: [],
  mounts: [],
  filters: [],
  accessories: [],
  software: []
};

context("Image edit (existing), test equipment presets", () => {
  beforeEach(() => {
    cy.server();
    cy.setupInitializationRoutes();
    cy.route(
      "GET",
      "**/api/v2/images/image/?hash=abc123",
      "fixture:api/images/image_without_equipment_by_hashes.json"
    ).as("getImage");
    cy.route("get", "/abc123/0/thumb/hd/", "fixture:api/images/image_thumbnail_1_regular_loaded").as("getThumbnail");
    cy.route(
      "GET",
      "**/api/v2/remote-source-affiliation/remote-source-affiliate/",
      "fixture:api/remote-source-affiliation/remote-source-affiliates.json"
    ).as("getRemoteSourceAffiliates");
    cy.route("get", "**/api/v2/groups/group/?members=1", "fixture:api/groups/groups.json").as("getGroups");
    cy.route("get", "**/api/v2/users/locations/", { count: 0, results: [] }).as("getUsersLocations");

    cy.route("get", "**/api/v2/equipment/brand/1/", "fixture:api/equipment_v2/brand_1.json").as("getBrand1");
    cy.route("get", "**/api/v2/equipment/telescope/1/", "fixture:api/equipment_v2/telescope_1.json").as(
      "getTelescope1"
    );
    cy.route("get", "**/api/v2/equipment/telescope/2/", "fixture:api/equipment_v2/telescope_2.json").as(
      "getTelescope2"
    );
    cy.route("get", "**/api/v2/equipment/telescope/3/", "fixture:api/equipment_v2/telescope_3.json").as(
      "getTelescope3"
    );
    cy.route("get", "**/api/v2/equipment/camera/1/", "fixture:api/equipment_v2/camera_1.json").as("getCamera1");
    cy.route("get", "**/api/v2/equipment/camera/2/", "fixture:api/equipment_v2/camera_2.json").as("getCamera2");
    cy.route("get", "**/api/v2/equipment/camera/3/", "fixture:api/equipment_v2/camera_3.json").as("getCamera3");
    cy.route("get", "**/api/v2/equipment/mount/1/", "fixture:api/equipment_v2/mount_1.json").as("getMount1");
    cy.route("get", "**/api/v2/equipment/filter/1/", "fixture:api/equipment_v2/filter_1.json").as("getFilter1");
    cy.route("get", "**/api/v2/equipment/accessory/1/", "fixture:api/equipment_v2/accessory_1.json").as(
      "getAccessory1"
    );
    cy.route("get", "**/api/v2/equipment/software/1/", "fixture:api/equipment_v2/software_1.json").as("getSoftware1");

    cy.route("get", /.*\/api\/v2\/equipment\/camera\/recently-used\/.*/, []).as("getRecentlyUsedCamera");
    cy.route("get", /.*\/api\/v2\/equipment\/telescope\/recently-used\/.*/, []).as("getRecentlyUsedTelescope");
    cy.route("get", /.*\/api\/v2\/equipment\/telescope\/recently-used\/\?usage-type=imaging/, [
      {
        id: 3,
        deleted: null,
        klass: "TELESCOPE",
        reviewedTimestamp: null,
        reviewerDecision: null,
        reviewerRejectionReason: null,
        reviewerComment: null,
        created: "2021-11-26T14:16:42.850333",
        updated: "2021-11-26T14:16:42.850345",
        name: "Test Telescope 3",
        website: null,
        image: null,
        type: "REFRACTOR_ACHROMATIC",
        aperture: "200.00",
        minFocalLength: "1000.00",
        maxFocalLength: "1000.00",
        weight: null,
        createdBy: 1,
        reviewedBy: null,
        brand: 1,
        group: null
      }
    ]).as("getRecentlyUsedTelescopeForImaging");
    cy.route("get", /.*\/api\/v2\/equipment\/mount\/recently-used\//, []).as("getRecentlyUsedMount");
    cy.route("get", /.*\/api\/v2\/equipment\/filter\/recently-used\//, []).as("getRecentlyUsedFilter");
    cy.route("get", /.*\/api\/v2\/equipment\/accessory\/recently-used\//, []).as("getRecentlyUsedAccessory");
    cy.route("get", /.*\/api\/v2\/equipment\/software\/recently-used\//, []).as("getRecentlyUsedSoftware");

    cy.route("get", "**/api/v2/equipment/equipment-preset/", [testEquipmentPreset]);

    cy.route("get", "**/api/v2/images/image-revision/*", { count: 0, results: [] }).as("getRevisions");
  });

  it("should navigate to the edit page", () => {
    cy.login();
    cy.visitPage("/i/abc123/edit#5");
    cy.wait("@getImage");
    cy.url().should("contain", "/i/abc123/edit");
  });

  it("should have the preset buttons", () => {
    cy.get("#clear-equipment-btn").should("be.visible");
    cy.get("#load-preset-btn").should("be.visible");
    cy.get("#save-preset-btn").should("be.visible");
  });

  it("should select a preset", () => {
    cy.get("#load-preset-btn").click();
    cy.get(".custom-radio label")
      .contains("Test preset")
      .click();
    cy.wait(500);
    cy.get(".btn-primary")
      .contains("Load")
      .click();

    cy.get("#image-imaging-telescopes-field .ng-value")
      .contains("Test Brand Test Telescope 1")
      .should("be.visible");

    cy.get("#image-imaging-telescopes-field .ng-value")
      .contains("Test Brand Test Telescope 2")
      .should("be.visible");

    cy.get("#image-imaging-cameras-field .ng-value")
      .contains("Test Brand Test Camera 1")
      .should("be.visible");

    cy.get("#image-imaging-cameras-field .ng-value")
      .contains("Test Brand Test Camera 2")
      .should("be.visible");

    cy.get("#image-mounts-field .ng-value")
      .contains("Test Brand Test Mount 1")
      .should("be.visible");

    cy.get("#image-filters-field .ng-value")
      .contains("Test Brand Test Filter 1")
      .should("be.visible");

    cy.get("#image-accessories-field .ng-value")
      .contains("Test Brand Test Accessory 1")
      .should("be.visible");

    cy.get("#image-software-field .ng-value")
      .contains("Test Brand Test Software 1")
      .should("be.visible");

    cy.get("#image-show-guiding-equipment-field + label").click();

    cy.get("#image-guiding-telescopes-field .ng-value")
      .contains("Test Brand Test Telescope 3")
      .should("be.visible");

    cy.get("#image-guiding-cameras-field .ng-value")
      .contains("Test Brand Test Camera 3")
      .should("be.visible");
  });

  it("should prefill the name when saving active preset", () => {
    cy.get("#save-preset-btn").click();
    cy.get(".modal .modal-title")
      .contains("Save equipment preset")
      .should("be.visible");
    cy.get(".modal input#name").should("have.value", "Test preset");
  });

  it("should prompt to overwrite", () => {
    cy.get(".modal .btn")
      .contains("Save")
      .click();

    cy.get(".modal .modal-title")
      .contains("Are you sure?")
      .should("be.visible");
  });

  it("should save", () => {
    cy.route("put", "**/api/v2/equipment/equipment-preset/1/", testEquipmentPreset);
    cy.get(".modal .btn")
      .contains("Yes, continue")
      .click();

    cy.get(".modal").should("not.be.visible");
    cy.get(".toast-message")
      .contains("Equipment preset updated.")
      .should("be.visible");
  });

  it("should clear the equipment", () => {
    cy.get("#clear-equipment-btn").click();

    cy.get(".modal .btn")
      .contains("Yes, continue")
      .click();
    cy.get("#clear-equipment-btn").should("be.disabled");

    cy.get("#image-imaging-telescopes-field .ng-value").should("have.length", 0);
    cy.get("#image-imaging-cameras-field .ng-value").should("have.length", 0);
    cy.get("#image-mounts-field .ng-value").should("have.length", 0);
    cy.get("#image-filters-field .ng-value").should("have.length", 0);
    cy.get("#image-accessories-field .ng-value").should("have.length", 0);
    cy.get("#image-software-field .ng-value").should("have.length", 0);
    cy.get("#image-guiding-telescopes-field .ng-value").should("have.length", 0);
    cy.get("#image-guiding-cameras-field .ng-value").should("have.length", 0);

    cy.get("#save-preset-btn").should("be.disabled");
  });

  it("should add a telescope", () => {
    cy.route("get", "**/api/v2/equipment/telescope/*", {
      count: 1,
      next: null,
      previous: null,
      results: [
        {
          id: 4,
          deleted: null,
          klass: "TELESCOPE",
          reviewedTimestamp: null,
          reviewerDecision: null,
          reviewerRejectionReason: null,
          reviewerComment: null,
          created: "2021-11-26T14:16:42.850333",
          updated: "2021-11-26T14:16:42.850345",
          name: "Foo 123",
          website: null,
          image: null,
          type: "REFRACTOR_ACHROMATIC",
          aperture: "222.00",
          minFocalLength: "1000.00",
          maxFocalLength: "1000.00",
          weight: null,
          createdBy: 1,
          reviewedBy: null,
          brand: 1,
          group: null
        }
      ]
    }).as("findTelescopes");

    cy.get("#image-imaging-telescopes-field + .toggle-enable-fullscreen").click();
    cy.get("#image-imaging-telescopes-field input[type='text']").type("Foo");
    cy.wait("@findTelescopes");

    cy.get("#image-imaging-telescopes-field .ng-option:first-child").click();
    cy.get("#image-imaging-telescopes-field .ng-select-container .ng-value")
      .contains("Test Brand Foo 123")
      .should("be.visible");
  });

  it("should save as a new preset", () => {
    cy.get("#save-preset-btn").click();
    cy.get(".modal .modal-title")
      .contains("Save equipment preset")
      .should("be.visible");
    cy.get(".modal input#name").should("have.value", "");
    cy.get(".modal input#name").type("Test preset 2");

    cy.route("post", "**/api/v2/equipment/equipment-preset/", testEquipmentPreset2);
    cy.get(".modal .btn")
      .contains("Save")
      .click();

    cy.get(".modal").should("not.be.visible");
    cy.get(".toast-message")
      .contains("Equipment preset created.")
      .should("be.visible");
  });

  it("should have updated the presets modal", () => {
    cy.get("#load-preset-btn").click();
    cy.get(".custom-radio label")
      .contains("Test preset 2")
      .should("be.visible");
  });

  it("should delete a preset", () => {
    cy.get(".custom-radio label")
      .contains("Test preset 2")
      .click();

    cy.get(".btn")
      .contains("Delete")
      .click();

    cy.route("delete", "**/api/v2/equipment/equipment-preset/2/", {});

    cy.get(".btn")
      .contains("Yes, continue")
      .click();

    cy.get(".custom-radio label")
      .contains("Test preset 2")
      .should("not.exist");
  });
});
