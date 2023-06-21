context("Image edit (new, with no groups)", () => {
  beforeEach(() => {
    cy.server();
    cy.setupInitializationRoutes();
    cy.route("get", "**/api/v2/images/image/?hash=abc123", "fixture:api/images/new_image_1_by_hashes.json").as(
      "getImage"
    );
    cy.route("get", "/abc123/0/thumb/hd/", "fixture:api/images/image_thumbnail_1_regular_loaded").as("getThumbnail");
    cy.route(
      "GET",
      "**/api/v2/remote-source-affiliation/remote-source-affiliate/",
      "fixture:api/remote-source-affiliation/remote-source-affiliates.json"
    ).as("getRemoteSourceAffiliates");
    cy.route("get", "**/api/v2/groups/group/*", "fixture:api/groups/no_groups.json").as("getGroups");
    cy.route("get", "**/api/v2/users/locations/", { count: 0, results: [] }).as("getUsersLocations");

    cy.route("get", "**/api/v2/equipment/camera/recently-used/*", []);
    cy.route("get", "**/api/v2/equipment/telescope/recently-used/*", []);
    cy.route("get", "**/api/v2/equipment/mount/recently-used/", []);
    cy.route("get", "**/api/v2/equipment/filter/recently-used/", []);
    cy.route("get", "**/api/v2/equipment/accessory/recently-used/", []);
    cy.route("get", "**/api/v2/equipment/software/recently-used/", []);

    cy.route("get", "**/api/v2/equipment/equipment-preset/", []);

    cy.route("get", "**/api/v2/images/image-revision/?image=1", "fixture:api/images/image_1.json");
  });

  it("should navigate to the edit page", () => {
    cy.login();
    cy.visitPage("/i/abc123/edit#2");
    cy.wait("@getImage");
    cy.wait("@getUsersLocations");
    cy.url().should("contain", "/i/abc123/edit");
  });

  it("should have the groups field as disabled", () => {
    cy.get("#image-groups-field").should("have.class", "ng-select-disabled");
    cy.get(".form-text")
      .contains("This field is disabled because you haven't joined any groups yet.")
      .should("exist");
  });
});
