import { testBrand, testCamera, testSensor } from "../../../support/commands/equipment-item-browser-utils";

context("Equipment", () => {
  beforeEach(() => {
    cy.server();
    cy.setupInitializationRoutes();

    cy.route("GET", "**/api/v2/equipment/camera/?q=*", {
      count: 1,
      next: null,
      previous: null,
      results: []
    }).as("findCameras");

    cy.route("GET", "**/api/v2/equipment/camera/", {
      count: 1,
      next: null,
      previous: null,
      results: [testCamera]
    }).as("getCameras");

    cy.route("GET", "**/api/v2/equipment/camera/?name=*", {
      count: 1,
      next: null,
      previous: null,
      results: []
    }).as("findCamerasByName");

    cy.route("GET", "**/api/v2/equipment/sensor/?q=*", {
      count: 1,
      next: null,
      previous: null,
      results: []
    }).as("findSensors");

    cy.route("GET", "**/api/v2/equipment/sensor/?name=*", { count: 1, results: [] }).as("findSensorsByName");
    cy.route("GET", "**/api/v2/equipment/sensor/others-in-brand/*", { count: 1, results: [testSensor] }).as(
      "sensorOthersInBrand"
    );
  });

  context("Explorer", () => {
    context("Create camera and use suggestion for sensor", () => {
      it("should start the creation process", () => {
        cy.login();
        cy.visitPage("/equipment/explorer");

        cy.equipmentItemBrowserCreate("#equipment-item-field", "Test", "@findCameras");
      });

      it("should select a brand", () => {
        cy.equipmentItemBrowserSelectFirstBrand("#equipment-item-field-brand", "Test brand", testBrand);
      });

      it("should create a sensor", () => {
        cy.equipmentItemBrowserCreate("#camera-field-sensor", "Test sensor", "@findSensors");

        cy.equipmentItemBrowserSelectFirstBrand(
          "astrobin-sensor-editor #equipment-item-field-brand",
          "Test brand",
          testBrand
        );

        cy.route("GET", "**/api/v2/equipment/sensor/find-similar-in-brand/*", [testSensor]).as("findSimilarSensors");

        cy.get("astrobin-sensor-editor #equipment-item-field-name").clear();
        cy.get("astrobin-sensor-editor #equipment-item-field-name").type("Test sensor");

        cy.wait("@findSimilarSensors");

        cy.get("astrobin-similar-items-suggestion").should("be.visible");
        cy.get("astrobin-similar-items-suggestion .btn").click();

        cy.ngSelectValueShouldContain("#camera-field-sensor", "Test sensor");
      });
    });
  });
});
