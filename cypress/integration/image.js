context.only("image", () => {
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
    cy.route("GET", "**/abc123/final/thumb/regular/", "fixture:api/images/image_thumbnail_1_story_placeholder.json").as(
      "getImageThumbnail"
    );
    cy.visitPage("/dev/image");
    cy.wait("@getImage");
    cy.wait("@getImageThumbnail");

    cy.get("astrobin-image img")
      .should("have.attr", "alt", "Test image")
      .should("have.attr", "width", "620")
      .should("have.attr", "height", "384")
      .should("have.attr", "src")
      .and("include", "placeholder");

    cy.route("GET", "**/abc123/final/thumb/regular/", "fixture:api/images/image_thumbnail_1_story_loaded.json").as(
      "getImageThumbnail"
    );
    cy.wait("@getImageThumbnail");

    cy.get("astrobin-image img")
      .should("have.attr", "src")
      .and("include", "story.jpg");
  });
});
