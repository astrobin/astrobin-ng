context("image", () => {
  beforeEach(() => {
    cy.server();
    cy.setupInitializationRoutes();
  });

  describe("when there is no thumbnail group", () => {
    beforeEach(() => {
      cy.route("GET", "**/api/v2/images/thumbnail-group/*", {
        count: 0,
        results: []
      }).as("getThumbnailGroup");
    });
  });

  it("should render placeholder first, then real image", () => {
    cy.route("GET", "**/api/v2/images/image/1/", "fixture:api/images/image_1.json").as("getImage");
    cy.route(
      "GET",
      "**/abc123/final/thumb/regular/",
      "fixture:api/images/image_thumbnail_1_regular_placeholder.json"
    ).as("getImageThumbnail");
    cy.visitPage("/dev/image");
    cy.wait("@getImage");
    cy.wait("@getImageThumbnail");

    cy.get("astrobin-image astrobin-loading-indicator").should("exist");

    cy.route("GET", "**/abc123/final/thumb/regular/", "fixture:api/images/image_thumbnail_1_regular_loaded.json").as(
      "getImageThumbnail"
    );
    cy.wait("@getImageThumbnail");
    cy.wait(2000);

    cy.get(".astrobin-image")
      .should("have.css", "background-image")
      .and("contain", "blob:http://localhost:4400/");
  });
});
