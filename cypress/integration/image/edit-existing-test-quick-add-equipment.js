context("Image edit (existing). test quick add equipment", () => {
  beforeEach(() => {
    cy.server();
    cy.setupInitializationRoutes();
    cy.route("get", "**/api/v2/images/image/?hash=abc123&skip-thumbnails=*", "fixture:api/images/image_1_by_hashes.json").as("getImage");
    cy.route("get", "/abc123/0/thumb/hd/", "fixture:api/images/image_thumbnail_1_regular_loaded").as("getThumbnail");
    cy.route(
      "GET",
      "**/api/v2/remote-source-affiliation/remote-source-affiliate/",
      "fixture:api/remote-source-affiliation/remote-source-affiliates.json"
    ).as("getRemoteSourceAffiliates");
    cy.route("get", "**/api/v2/groups/group/?members=1", "fixture:api/groups/groups.json").as("getGroups");
    cy.route("get", "**/api/v2/users/locations/", { count: 0, results: [] }).as("getUsersLocations");

    cy.route("get", "**/api/v2/equipment/brand/1/", "fixture:api/equipment_v2/brand_1.json").as("getBrand1");
    cy.route("get", /.*\/api\/v2\/equipment\/telescope\/1\//, "fixture:api/equipment_v2/telescope_1.json").as(
      "getTelescope1"
    );
    cy.route("get", /.*\/api\/v2\/equipment\/telescope\/2\//, "fixture:api/equipment_v2/telescope_2.json").as(
      "getTelescope2"
    );
    cy.route("get", /.*\/api\/v2\/equipment\/telescope\/3\//, "fixture:api/equipment_v2/telescope_3.json").as(
      "getTelescope3"
    );
    cy.route("get", /.*\/api\/v2\/equipment\/camera\/1\//, "fixture:api/equipment_v2/camera_1.json").as("getCamera1");
    cy.route("get", /.*\/api\/v2\/equipment\/camera\/2\//, "fixture:api/equipment_v2/camera_2.json").as("getCamera2");
    cy.route("get", /.*\/api\/v2\/equipment\/camera\/3\//, "fixture:api/equipment_v2/camera_3.json").as("getCamera3");
    cy.route("get", /.*\/api\/v2\/equipment\/mount\/1\//, "fixture:api/equipment_v2/mount_1.json").as("getMount1");
    cy.route("get", /.*\/api\/v2\/equipment\/filter\/1\//, "fixture:api/equipment_v2/filter_1.json").as("getFilter1");
    cy.route("get", /.*\/api\/v2\/equipment\/accessory\/1\//, "fixture:api/equipment_v2/accessory_1.json").as(
      "getAccessory1"
    );
    cy.route("get", /.*\/api\/v2\/equipment\/software\/1\//, "fixture:api/equipment_v2/software_1.json").as(
      "getSoftware1"
    );

    cy.route("get", /.*\/api\/v2\/equipment\/camera\/recently-used\/.*/, []);
    cy.route("get", /.*\/api\/v2\/equipment\/telescope\/recently-used\/.*/, []);
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
    ]);
    cy.route("get", /.*\/api\/v2\/equipment\/mount\/recently-used\//, []);
    cy.route("get", /.*\/api\/v2\/equipment\/filter\/recently-used\//, []);
    cy.route("get", /.*\/api\/v2\/equipment\/accessory\/recently-used\//, []);
    cy.route("get", /.*\/api\/v2\/equipment\/software\/recently-used\//, []);

    cy.route("get", "**/api/v2/equipment/equipment-preset/", []);

    cy.route("get", "**/api/v2/images/image-revision/*", { count: 0, results: [] }).as("getRevisions");
  });

  it("should navigate to the edit page", () => {
    cy.login();
    cy.visitPage("/i/abc123/edit#5");
    cy.wait("@getImage");
    cy.url().should("contain", "/i/abc123/edit");
  });

  it("should have quick-add for imaging telescopes", () => {
    cy.get("[ng-reflect-id=\"image-imaging-telescopes-field\"] + .quick-add").should("be.visible");
    cy.get("[ng-reflect-id=\"image-imaging-telescopes-field\"] + .quick-add .quick-add-item").click();

    cy.get("#image-imaging-telescopes-field .ng-value")
      .contains("Test Brand Test Telescope 3")
      .should("be.visible");
  });

  it("should not have quick-add for guiding telescopes", () => {
    cy.get("[ng-reflect-id=\"image-guiding-telescopes-field\"] + .quick-add .no-recent").should("be.visible");
  });
});
