context("IOTD Submission queue", () => {
  beforeEach(() => {
    cy.server();
    cy.setupInitializationRoutes();
  });

  it("should render page elements", () => {
    cy.route("GET", "**/api/v2/images/image/*/", "fixture:api/images/image_1.json").as("getImage");
    cy.route("GET", "**/*/final/thumb/*/", "fixture:api/images/image_thumbnail_1_story_loaded.json").as(
      "getImageThumbnail"
    );
    cy.route("GET", "**/api/v2/iotd/submission-queue/?page=*", "fixture:api/iotd/submission-queue.json").as(
      "submissionQueue"
    );
    cy.route("GET", "**/api/v2/astrobin/telescope/*/", "fixture:api/telescopes/telescope_1.json").as("getTelescope");
    cy.route("GET", "**/api/v2/astrobin/camera/*/", "fixture:api/cameras/camera_1.json").as("getCamera");

    cy.visitPage("/iotd/submission-queue");

    cy.get("h1 > span")
      .contains("Submission queue")
      .should("exist");

    cy.get(".submission-queue-entry")
      .its("length")
      .should("eq", 2);

    cy.get(".submission-queue-entry")
      .first()
      .find("astrobin-telescope")
      .contains("Test telescope make 1 Test telescope name 1")
      .should("exist");

    cy.get(".submission-queue-entry")
      .first()
      .find("astrobin-camera")
      .contains("Test camera make 1 Test camera name 1")
      .should("exist");
  });
});
