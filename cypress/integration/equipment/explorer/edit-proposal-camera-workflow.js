import {
  testBrand,
  testCamera,
  testCameraEditProposal,
  testSensor
} from "../../../support/commands/equipment-item-browser-utils";

context("Equipment", () => {
  beforeEach(() => {
    cy.server();
    cy.setupInitializationRoutes();

    cy.route("GET", "**/api/v2/equipment/camera/?q=*", {
      count: 1,
      next: null,
      previous: null,
      results: [testCamera]
    }).as("findCameras");

    cy.route("GET", "**/api/v2/equipment/camera/?name=*", {
      count: 1,
      next: null,
      previous: null,
      results: [testCamera]
    }).as("findCamerasByName");

    cy.route("GET", "**/api/v2/equipment/camera/", {
      count: 1,
      next: null,
      previous: null,
      results: [testCamera]
    }).as("getCameras");

    cy.route("GET", "**/api/v2/equipment/brand/1/", testBrand).as("getBrand");

    cy.route("GET", "**/api/v2/equipment/sensor/1/", testSensor).as("getSensor");

    cy.route("GET", "**/api/v2/equipment/camera-edit-proposal/?editProposalTarget=*", { results: [] });
  });

  context("Explorer", () => {
    it("should not have the 'Propose edit' button if logged out", () => {
      cy.visitPage("/equipment/explorer");

      cy.equipmentItemBrowserSelectFirstCamera("#equipment-item-field", "Test", testCamera);

      cy.get(".card .card-header")
        .contains("Camera")
        .should("be.visible");

      cy.get(".card .card-body astrobin-equipment-item-summary").should("be.visible");

      cy.get("[data-test=propose-edit]").should("not.exist");
    });

    it("should have the 'Propose edit' button if logged in", () => {
      cy.login();
      cy.visitPage("/equipment/explorer");

      cy.equipmentItemBrowserSelectFirstCamera("#equipment-item-field", "Test", testCamera);

      cy.get(".card .card-header")
        .contains("Camera")
        .should("be.visible");

      cy.get(".card .card-body astrobin-equipment-item-summary").should("be.visible");

      cy.get("[data-test=propose-edit]").should("be.visible");
    });

    it("should show all the prefilled data in the form", () => {
      cy.get("[data-test=propose-edit]").click();
      cy.get("astrobin-camera-editor").should("be.visible");
      cy.ngSelectValueShouldContain("#equipment-item-field-brand", testBrand.name);
      cy.get("#equipment-item-field-name").should("have.value", testCamera.name);
      cy.ngSelectValueShouldContain("#camera-field-type", "Dedicated deep-sky camera");
      cy.ngSelectValueShouldContain("#camera-field-sensor", `${testBrand.name} ${testSensor.name}`);
      cy.get("#camera-field-cooled").should("be.checked");
      cy.get("#camera-field-max-cooling").should("have.value", testCamera.maxCooling);
      cy.get("#camera-field-back-focus").should("have.value", testCamera.backFocus);
    });

    it("should show warning if name is changed", () => {
      cy.route("GET", "**/api/v2/equipment/camera/?name=*", {
        count: 1,
        next: null,
        previous: null,
        results: []
      }).as("findCamerasByName");

      cy.get("#equipment-item-field-name")
        .clear()
        .type("Foo");

      cy.wait("@findCamerasByName");

      cy.get(".alert-warning span")
        .contains("Change the name only to fix a typo")
        .should("be.visible");
    });

    it("should submit the form", () => {
      cy.route("POST", "**/api/v2/equipment/camera-edit-proposal/", testCameraEditProposal).as("saveEditProposal");

      cy.get("[data-test=propose-edit-confirm]").click();

      cy.wait("@saveEditProposal");

      cy.get(".toast-message")
        .contains("Your edit proposal has been submitted")
        .should("be.visible");

      cy.get("astrobin-camera-editor").should("not.be.visible");
    });
  });
});
