context.only("IOTD Submission queue", () => {
  beforeEach(() => {
    cy.server();
    cy.setupInitializationRoutes();
  });

  describe("when not logged in", () => {
    it("should redirect you to the login page", () => {
      cy.visitPage("/iotd/submission-queue");
      cy.url().should("contain", "http://localhost:4400/account/login");
    });
  });

  describe("when logged in and not in the iotd_submitters group", () => {
    it("should redirect you to the login page", () => {
      cy.login();
      cy.visitPage("/iotd/submission-queue");
      cy.url().should("equal", "http://localhost:4400/iotd/submission-queue");
      cy.get("h1")
        .contains("403")
        .should("exist");
    });
  });

  describe("when logged in and in the iotd_submitters_group ", () => {
    beforeEach(() => {
      cy.login();
      cy.route("GET", "**/common/userprofiles/current", "fixture:api/common/userprofile_current_3.json").as(
        "getCurrentUserProfile"
      );
      cy.route("GET", "**/common/users/*", "fixture:api/common/users_3_iotd_submitter.json").as("getUser");
    });

    it("should render page elements", () => {
      cy.route("GET", "**/api/v2/images/image/*/", "fixture:api/images/image_1.json").as("getImage");
      cy.route("GET", "**/*/final/thumb/story/", "fixture:api/images/image_thumbnail_1_story_loaded.json").as(
        "getImageThumbnail"
      );
      cy.route("GET", "**/*/final/thumb/story_crop/", "fixture:api/images/image_thumbnail_1_story_crop_loaded.json").as(
        "getImageThumbnail"
      );
      cy.route("GET", "**/api/v2/iotd/submission-queue/?page=*", "fixture:api/iotd/submission-queue.json").as(
        "submissionQueue"
      );
      cy.route("GET", "**/api/v2/iotd/submission", []).as("submissions");
      cy.route("GET", "**/api/v2/astrobin/telescope/*/", "fixture:api/telescopes/telescope_1.json").as("getTelescope");
      cy.route("GET", "**/api/v2/astrobin/camera/*/", "fixture:api/cameras/camera_1.json").as("getCamera");

      cy.visitPage("/iotd/submission-queue");

      cy.get("h1")
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

    it("should have 3 empty slots", () => {
      cy.get(".promotion-slot")
        .contains("1")
        .should("exist");
      cy.get(".promotion-slot")
        .contains("2")
        .should("exist");
      cy.get(".promotion-slot")
        .contains("3")
        .should("exist");
      cy.get(".promotion-slot")
        .contains("4")
        .should("not.exist");
    });

    it("should add a submission to a slot", () => {
      cy.route("POST", "**/api/v2/iotd/submission/", {
        id: 1,
        submitter: 3,
        image: 1,
        date: new Date().toISOString()
      }).as("postSubmission");

      cy.get("#submission-queue-entry-1 .btn")
        .contains("Promote")
        .click();

      cy.get("#submission-queue-entry-1 .btn")
        .contains("Hide")
        .should("be.disabled");
      cy.get(".promotion-slot astrobin-image[data-id=1]").should("exist");
    });

    it("should remove a submission to a slot", () => {
      cy.route("DELETE", "**/api/v2/iotd/submission/1/", {}).as("deleteSubmission");

      cy.get("#submission-queue-entry-1 .btn")
        .contains("Retract promotion")
        .click();

      cy.get("#submission-queue-entry-1 .btn")
        .contains("Hide")
        .should("not.be.disabled");
      cy.get(".promotion-slot astrobin-image[data-id=1]").should("not.exist");
      cy.get(".promotion-slot")
        .contains("1")
        .should("exist");
    });

    it("should hide a submission entry", () => {
      cy.get("#submission-queue-entry-1 .btn")
        .contains("Hide")
        .click();

      cy.get("#submission-queue-entry-1").should("not.exist");
    });
  });
});
