// context("IOTD Submission queue", () => {
//   beforeEach(() => {
//     cy.server();
//     cy.setupInitializationRoutes();
//     cy.route("get", "**/api/v2/platesolving/solutions/*", []).as("getSolution");
//   });
//
//   describe("when not logged in", () => {
//     it("should redirect you to the login page", () => {
//       cy.visitPage("/iotd/submission-queue");
//       cy.url().should("contain", "http://localhost:4400/account/logging-in");
//     });
//   });
//
//   describe("when logged in and not in the iotd_submitters group", () => {
//     it("should redirect you to the login page", () => {
//       cy.login();
//       cy.visitPage("/iotd/submission-queue");
//       cy.url().should("equal", "http://localhost:4400/iotd/submission-queue");
//       cy.get("h1")
//         .contains("403")
//         .should("exist");
//     });
//   });
//
//   describe("when logged in and in the iotd_submitters_group ", () => {
//     beforeEach(() => {
//       cy.login();
//
//       cy.route("get", "**/000000/final/thumb/hd_anonymized/", "fixture:api/images/image_thumbnail_1_hd_loaded.json");
//       cy.route("get", "**/000000/final/thumb/story/", "fixture:api/images/image_thumbnail_1_story_loaded.json");
//
//       cy.route("get", "**/000001/final/thumb/hd_anonymized/", "fixture:api/images/image_thumbnail_1_hd_loaded.json");
//       cy.route("get", "**/000001/final/thumb/story/", "fixture:api/images/image_thumbnail_1_story_loaded.json");
//
//       cy.route("get", "**/api/v2/images/image-revision/?image=*", { results: [] }).as("getImageRevisions");
//
//       cy.route("get", "**/common/userprofiles/current", "fixture:api/common/userprofile_current_3.json").as(
//         "getCurrentUserProfile"
//       );
//       cy.route("get", "**/common/users/*", "fixture:api/common/users_3_iotd_submitter.json").as("getUser");
//
//       cy.route("get", "**/iotd/staff-member-settings/", { user: 1, queueSortOrder: "OLDEST" });
//
//       cy.route("get", "**/api/v2/images/image-revision/?image=1", { results: [] }).as("getImageRevisions");
//     });
//
//     it("should render page elements", () => {
//       cy.route("get", "**/api/v2/images/image/?id=*", "fixture:api/images/images_1_and_2.json").as("getImages");
//       cy.route("get", "**/*/final/thumb/story/", "fixture:api/images/image_thumbnail_1_story_loaded.json").as(
//         "getImageThumbnail"
//       );
//       cy.route("get", "**/*/final/thumb/story_crop/", "fixture:api/images/image_thumbnail_1_story_crop_loaded.json").as(
//         "getImageThumbnail"
//       );
//       cy.route("get", "**/api/v2/iotd/submission-queue/?page=*", "fixture:api/iotd/submission-queue.json").as(
//         "submissionQueue"
//       );
//       cy.route("get", "**/api/v2/iotd/hidden-image/", []).as("hiddenImages");
//       cy.route("get", "**/api/v2/iotd/dismissed-image/", []).as("dismissedImages");
//       cy.route("get", "**/api/v2/iotd/submission", []).as("submissions");
//       cy.route("get", "**/api/v2/astrobin/telescope/*/", "fixture:api/telescopes/telescope_1.json").as("getTelescope");
//       cy.route("get", "**/api/v2/astrobin/camera/*/", "fixture:api/cameras/camera_1.json").as("getCamera");
//
//       cy.visitPage("/iotd/submission-queue");
//
//       cy.get("h1")
//         .contains("Submission queue")
//         .should("exist");
//
//       cy.get(".promotion-queue-entry")
//         .its("length")
//         .should("eq", 2);
//
//       cy.get(".promotion-queue-entry")
//         .first()
//         .find("astrobin-telescope")
//         .contains("Test telescope make 1 Test telescope name 1")
//         .should("exist");
//
//       cy.get(".promotion-queue-entry")
//         .first()
//         .find("astrobin-camera")
//         .contains("Test camera make 1 Test camera name 1")
//         .should("exist");
//     });
//
//     it("should have 3 empty slots", () => {
//       cy.get(".promotion-slot")
//         .contains("1")
//         .should("exist");
//       cy.get(".promotion-slot")
//         .contains("2")
//         .should("exist");
//       cy.get(".promotion-slot")
//         .contains("3")
//         .should("exist");
//       cy.get(".promotion-slot")
//         .contains("4")
//         .should("not.exist");
//     });
//
//     it("should add a promotion to a slot", () => {
//       cy.route("post", "**/api/v2/iotd/submission/", {
//         id: 1,
//         submitter: 3,
//         image: 1,
//         date: new Date().toISOString()
//       }).as("postSubmission");
//
//       cy.get("#promotion-queue-entry-1 .btn")
//         .contains("Promote")
//         .click();
//
//       cy.get("#promotion-queue-entry-1 .btn")
//         .contains("Hide")
//         .should("be.disabled");
//       cy.get(".promotion-slot astrobin-image[data-id=1]").should("exist");
//     });
//
//     it("should remove a promotion from a slot", () => {
//       cy.route("delete", "**/api/v2/iotd/submission/1/", {}).as("deleteSubmission");
//
//       cy.get("#promotion-queue-entry-1 .btn")
//         .contains("Retract promotion")
//         .click();
//
//       cy.get("#promotion-queue-entry-1 .btn")
//         .contains("Hide")
//         .should("not.be.disabled");
//       cy.get(".promotion-slot astrobin-image[data-id=1]").should("not.exist");
//       cy.get(".promotion-slot")
//         .contains("1")
//         .should("exist");
//     });
//
//     it("should hide a promotion entry", () => {
//       cy.route("post", "**/api/v2/iotd/hidden-image/", {
//         id: 1,
//         image: 1,
//         create: new Date().toISOString()
//       }).as("hideImage");
//
//       cy.get("#promotion-queue-entry-1 .btn")
//         .contains("Hide")
//         .click();
//
//       cy.get("#promotion-queue-entry-1 .card-body").should("not.be.visible");
//       cy.get("#promotion-queue-entry-1 .card-footer").should("not.be.visible");
//     });
//
//     it("should show a promotion entry again", () => {
//       cy.route("delete", "**/api/v2/iotd/hidden-image/1", {}).as("showImage");
//
//       cy.get("#promotion-queue-entry-1 .btn")
//         .contains("Show")
//         .click();
//
//       cy.get("#promotion-queue-entry-1 .card-body").should("be.visible");
//       cy.get("#promotion-queue-entry-1 .card-footer").should("be.visible");
//     });
//   });
// });
