context("Image component", () => {
  beforeEach(() => {
    cy.server();
    cy.setupInitializationRoutes();
  });

  it("should render placeholder first, then real image", () => {
    cy.route("get", "**/api/v2/images/image/1/", "fixture:api/images/image_1.json").as("getImage");
    cy.route("get", "**/api/v2/images/image-revision/?image=1", { results: [] }).as("getImageRevisions");

    cy.visitPage("/dev/image");
    cy.wait("@getImage");
    cy.get(".astrobin-image")
      .should("have.attr", "src")
      .and("contain", "assets/test/images/regular.jpg");
  });
});
