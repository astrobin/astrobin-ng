context("Image edit (new, with no groups)", () => {
  beforeEach(() => {
    cy.server();
    cy.setupInitializationRoutes();
    cy.route("GET", "**/api/v2/images/image/?hashes=abc123", "fixture:api/images/new_image_1_by_hashes.json").as(
      "getImage"
    );
    cy.route("GET", "/abc123/0/thumb/hd/", "fixture:api/images/image_thumbnail_1_regular_loaded").as("getThumbnail");
    cy.route(
      "GET",
      "**/api/v2/remote-source-affiliation/remote-source-affiliate/",
      "fixture:api/remote-source-affiliation/remote-source-affiliates.json"
    ).as("getRemoteSourceAffiliates");
    cy.route("GET", "**/api/v2/groups/group/*", "fixture:api/groups/no_groups.json").as("getGroups");
  });

  it("should navigate to the edit page", () => {
    cy.login();
    cy.visitPage("/i/abc123/edit#2");
    cy.wait("@getImage");
    cy.url().should("contain", "/i/abc123/edit");
  });

  it("should have the groups field as disabled", () => {
    cy.get("#image-groups-field").should("have.class", "ng-select-disabled");
    cy.get(".form-text")
      .contains("This field is disabled because you haven't joined any groups yet.")
      .should("exist");
  });
});
