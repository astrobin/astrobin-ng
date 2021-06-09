context("Image edit (new)", () => {
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
    cy.route("GET", "**/api/v2/groups/group/*", "fixture:api/groups/groups.json").as("getGroups");
    cy.route("GET", "**/api/v2/users/locations/", { count: 0, results: [] }).as("getUsersLocations");
  });

  it("should navigate to the edit page", () => {
    cy.login();
    cy.visitPage("/i/abc123/edit");
    cy.wait("@getImage");
    cy.wait("@getUsersLocations");
    cy.url().should("contain", "/i/abc123/edit");
  });

  it("should show the 'new editor' alert", () => {
    cy.get("#new-editor-alert").should("not.exist");
  });

  it("should have all tabs", () => {
    cy.get("#image-stepper-field .nav-link").should("have.length", 5);
  });

  it("should not have any tabs marked as error, since we haven't visited any yet", () => {
    cy.get("#image-stepper-field .nav-item.danger.done").should("not.exist");
  });

  it("should have the #1 fragment", () => {
    cy.url().should("contain", "#1");
  });

  it("should have prefilled the basic information step", () => {
    cy.get("#image-title-field").should("have.value", "Test image");
    cy.get("#image-description-field").should("have.value", "");
    cy.get("#image-link-field").should("have.value", "");
    cy.get("#image-link-to-fits-field").should("have.value", "");
  });

  it("should mark the step as errored if a required field is cleared", () => {
    cy.get("#image-title-field").clear();
    cy.get("#image-stepper-field .nav-item.danger .nav-link small")
      .contains("Basic information")
      .should("exist");

    cy.get("#image-title-field").type("Test image");
    cy.get("#image-stepper-field .nav-item.danger .nav-link small")
      .contains("Basic information")
      .should("not.exist");
  });

  it("should have prefilled the content step", () => {
    cy.get("#image-stepper-field .nav-link small")
      .contains("Content")
      .click();

    cy.url().should("contain", "#2");

    cy.get("#image-acquisition-type-field .ng-value").should("not.exist");
    cy.get("#image-subject-type-field .ng-value").should("not.exist");
    cy.get("#image-data-source-field .ng-value").should("not.exist");

    cy.get("#image-groups-field").should("be.visible");
    cy.get("#image.groups-field .ng-value-container .ng-value").should("have.length", 0);
  });

  it("should select an acquisition type", () => {
    cy.get("#image-acquisition-type-field").click();
    cy.get("#image-acquisition-type-field .ng-option")
      .contains("Regular")
      .click();
    cy.get("#image-acquisition-type-field .ng-value").should("contain.text", "Regular");
  });

  it("should select a subject type", () => {
    cy.get("#image-subject-type-field").click();
    cy.get("#image-subject-type-field .ng-option")
      .contains("Deep sky")
      .click();
    cy.get("#image-subject-type-field .ng-value").should("contain.text", "Deep sky");
    cy.get("#image-solar-system-main-subject-field").should("not.be.visible");
  });

  it("should display solar system main subject field if solar system is selected", () => {
    cy.get("#image-subject-type-field").click();
    cy.get("#image-subject-type-field .ng-option")
      .contains("Solar system")
      .click();
    cy.get("#image-subject-type-field .ng-value").should("contain.text", "Solar system");
    cy.get("#image-solar-system-main-subject-field").should("be.visible");
  });

  it("should select a solar system main subject type", () => {
    cy.get("#image-solar-system-main-subject-field").click();
    cy.get("#image-solar-system-main-subject-field .ng-option")
      .contains("Moon")
      .click();
    cy.get("#image-solar-system-main-subject-field .ng-value").should("contain.text", "Moon");
  });

  it("should select an amateur hosting facility data source", () => {
    cy.get("#image-data-source-field").click();
    cy.get("#image-data-source-field .ng-option")
      .contains("Amateur hosting facility")
      .click();
    cy.get("#image-data-source-field .ng-value").should("contain.text", "Amateur hosting facility");

    cy.get("#image-remote-source-field").should("be.visible");
  });

  it("should select a remote data source", () => {
    cy.get("#image-remote-source-field").click();
    cy.get("#image-remote-source-field .ng-option")
      .contains("DeepSkyWest")
      .click();
    cy.get("#image-remote-source-field .ng-value").should("contain.text", "DeepSkyWest");

    cy.get("#image-remote-source-field").should("be.visible");
  });

  it("should not display the locations field when a commercial remote data source is selected", () => {
    cy.get("#image-locations-field").should("not.be.visible");
  });

  it("should select a backyard data source", () => {
    cy.get("#image-data-source-field").click();
    cy.get("#image-data-source-field .ng-option")
      .contains("Backyard")
      .click();
    cy.get("#image-data-source-field .ng-value").should("contain.text", "Backyard");
    cy.get("#image-remote-source-field").should("not.be.visible");
    cy.get("#image-locations-field").should("be.visible");
  });

  it("should create a location", () => {
    cy.mockGeolocation();

    const location = {
      id: 1,
      name: "Home observatory",
      city: "Zurich",
      state: "ZH",
      country: "CH",
      lat_deg: 10,
      lat_min: 11,
      lat_sec: 12,
      lat_side: "N",
      lon_deg: 10,
      lon_min: 11,
      lon_sec: 12,
      lon_side: "E",
      altitude: 400
    };

    cy.route("POST", "**/api/v2/astrobin/location/", location).as("createLocation");
    cy.route("PUT", "**/api/v2/common/userprofiles/1/partial/", {
      locations: [location]
    }).as("updateUserProfile");

    cy.get("#image-locations-field").click();
    cy.get("#image-locations-field .ng-option.ng-option-disabled")
      .contains("No items found. Type something to create a new one...")
      .should("be.visible");
    cy.get("#image-locations-field").type("Home observatory");

    cy.get("#image-locations-field .ng-option").click();

    cy.get("astrobin-create-location-modal").should("be.visible");
    cy.get("astrobin-create-location-modal .form-control#name").should("have.value", "Home observatory");

    cy.get("astrobin-create-location-modal .btn")
      .contains("Save")
      .click();

    cy.get("formly-validation-message")
      .contains("This field is required")
      .should("exist");

    cy.get("astrobin-create-location-modal .form-control#altitude").type("400");

    cy.get("astrobin-create-location-modal .btn")
      .contains("Save")
      .click();

    cy.wait("@createLocation");
    cy.wait("@updateUserProfile");

    cy.get("astrobin-create-location-modal").should("not.be.visible");
    cy.get("#image-locations-field .ng-value-container .ng-value")
      .contains("Home observatory")
      .should("exist");
  });

  it("should select a group", () => {
    cy.get(".form-text")
      .contains("This field is disabled because you haven't joined any groups yet.")
      .should("not.exist");
    cy.get(".form-text")
      .contains("This setting will take affect after the image will be moved to your public area.")
      .should("exist");

    cy.get("#image-groups-field").click();
    cy.get("#image-groups-field .ng-option")
      .contains("First test group")
      .click();
    cy.get("#image-groups-field .ng-value").should("contain.text", "First test group");
  });

  it("should display remote source if data source is remote", () => {
    cy.get("#image-data-source-field").click();
    cy.get("#image-data-source-field .ng-option")
      .contains("remote")
      .click();
    cy.get("#image-data-source-field .ng-value").should("contain.text", "remote");
    cy.get("#image-remote-source-field").should("be.visible");
  });

  it("should select a remote source", () => {
    cy.get("#image-remote-source-field").click();
    cy.get("#image-remote-source-field .ng-option")
      .contains("ChileScope")
      .click();
    cy.get("#image-remote-source-field .ng-value").should("contain.text", "ChileScope");
  });

  it("should unmark the content step as errored", () => {
    cy.get("#image-stepper-field .nav-item.danger").should("not.exist");
  });

  it("should have prefilled the watermark step", () => {
    cy.get("#image-stepper-field .nav-link small")
      .contains("Watermark")
      .click();

    cy.url().should("contain", "#4");

    cy.get("#image-watermark-field").should("not.be.checked");
    cy.get("#image-watermark-text-field").should("have.value", "Copyright astrobin_dev");
    cy.get("#image-watermark-position-field .ng-value").should("contain.text", "Center");
    cy.get("#image-watermark-size-field .ng-value").should("contain.text", "Medium");
    cy.get("#image-watermark-opacity-field").should("have.value", "10");
  });

  it("should set the watermark checkbox as checked if the watermark text changes", () => {
    cy.get("#image-watermark-text-field").type("Test");
    cy.get("#image-watermark-field").should("be.checked");
  });

  it("should set the watermark checkbox as checked if the watermark position changes", () => {
    cy.get("[for=image-watermark-field]").click();
    cy.get("#image-watermark-field").should("not.be.checked");
    cy.get("#image-watermark-position-field").click();
    cy.get("#image-watermark-position-field .ng-option")
      .contains("Top right")
      .click();
    cy.get("#image-watermark-field").should("be.checked");
  });

  it("should set the watermark checkbox as checked if the watermark size changes", () => {
    cy.get("[for=image-watermark-field]").click();
    cy.get("#image-watermark-field").should("not.be.checked");
    cy.get("#image-watermark-size-field").click();
    cy.get("#image-watermark-size-field .ng-option")
      .contains("Large")
      .click();
    cy.get("#image-watermark-field").should("be.checked");
  });

  it("should set the watermark checkbox as checked if the watermark opacity changes", () => {
    cy.get("[for=image-watermark-field]").click();
    cy.get("#image-watermark-field").should("not.be.checked");
    cy.get("#image-watermark-opacity-field").clear();
    cy.get("#image-watermark-opacity-field").type("100");
    cy.get("#image-watermark-field").should("be.checked");
  });

  it("should have prefilled the settings step", () => {
    cy.get("#image-stepper-field .nav-link small")
      .contains("Settings")
      .click();

    cy.url().should("contain", "#5");

    cy.get("#image-license-field .ng-value").should(
      "contain.text",
      "Attribution-NonCommercial-ShareAlike Creative Commons"
    );
    cy.get("#image-mouse-hover-image-field .ng-value").should("contain.text", "Plate-solution");
    cy.get("#image-allow-comments-field").should("be.checked");
    cy.get("#image-full-size-display-limitation-field .ng-value").should("contain.text", "Everybody");
  });
});
