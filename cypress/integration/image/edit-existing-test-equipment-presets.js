context("Image edit (existing)", () => {
  beforeEach(() => {
    cy.server();
    cy.setupInitializationRoutes();
    cy.route(
      "GET",
      "**/api/v2/images/image/?hash=abc123",
      "fixture:api/images/image_without_equipment_by_hashes.json"
    ).as("getImage");
    cy.route("GET", "/abc123/0/thumb/hd/", "fixture:api/images/image_thumbnail_1_regular_loaded").as("getThumbnail");
    cy.route(
      "GET",
      "**/api/v2/remote-source-affiliation/remote-source-affiliate/",
      "fixture:api/remote-source-affiliation/remote-source-affiliates.json"
    ).as("getRemoteSourceAffiliates");
    cy.route("GET", "**/api/v2/groups/group/?members=1", "fixture:api/groups/groups.json").as("getGroups");
    cy.route("GET", "**/api/v2/users/locations/", { count: 0, results: [] }).as("getUsersLocations");

    cy.route("GET", "**/api/v2/equipment/brand/1/", "fixture:api/equipment_v2/brand_1.json").as("getBrand1");
    cy.route("GET", "**/api/v2/equipment/telescope/1/", "fixture:api/equipment_v2/telescope_1.json").as(
      "getTelescope1"
    );
    cy.route("GET", "**/api/v2/equipment/telescope/2/", "fixture:api/equipment_v2/telescope_2.json").as(
      "getTelescope2"
    );
    cy.route("GET", "**/api/v2/equipment/telescope/3/", "fixture:api/equipment_v2/telescope_3.json").as(
      "getTelescope3"
    );
    cy.route("GET", "**/api/v2/equipment/camera/1/", "fixture:api/equipment_v2/camera_1.json").as("getCamera1");
    cy.route("GET", "**/api/v2/equipment/camera/2/", "fixture:api/equipment_v2/camera_2.json").as("getCamera2");
    cy.route("GET", "**/api/v2/equipment/camera/3/", "fixture:api/equipment_v2/camera_3.json").as("getCamera3");
    cy.route("GET", "**/api/v2/equipment/mount/1/", "fixture:api/equipment_v2/mount_1.json").as("getMount1");
    cy.route("GET", "**/api/v2/equipment/filter/1/", "fixture:api/equipment_v2/filter_1.json").as("getFilter1");
    cy.route("GET", "**/api/v2/equipment/accessory/1/", "fixture:api/equipment_v2/accessory_1.json").as(
      "getAccessory1"
    );
    cy.route("GET", "**/api/v2/equipment/software/1/", "fixture:api/equipment_v2/software_1.json").as("getSoftware1");

    cy.route("GET", "**/api/v2/equipment/camera/recently-used/*", []);
    cy.route("GET", "**/api/v2/equipment/telescope/recently-used/?usage-type=imaging", [
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
    ]);
    cy.route("GET", "**/api/v2/equipment/telescope/recently-used/?usage-type=guiding", []);
    cy.route("GET", "**/api/v2/equipment/mount/recently-used/", []);
    cy.route("GET", "**/api/v2/equipment/filter/recently-used/", []);
    cy.route("GET", "**/api/v2/equipment/accessory/recently-used/", []);
    cy.route("GET", "**/api/v2/equipment/software/recently-used/", []);

    cy.route("GET", "**/api/v2/equipment/equipment-preset/", [
      {
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
      }
    ]);
  });

  it("should navigate to the edit page", () => {
    cy.login();
    cy.visitPage("/i/abc123/edit#5");
    cy.wait("@getImage");
    cy.url().should("contain", "/i/abc123/edit");
  });

  it("should have the preset buttons", () => {
    cy.get("#clear-equipment-btn").should("be.visible");
    cy.get("#load-preset-dropdown").should("be.visible");
    cy.get("#save-preset-btn").should("be.visible");
  });

  it("should select a preset", () => {
    cy.get("#load-preset-dropdown").click();
    cy.get(".dropdown-item")
      .contains("Test preset")
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

    cy.get("#image-guiding-telescopes-field .ng-value")
      .contains("Test Brand Test Telescope 3")
      .should("be.visible");

    cy.get("#image-guiding-cameras-field .ng-value")
      .contains("Test Brand Test Camera 3")
      .should("be.visible");
  });
});
