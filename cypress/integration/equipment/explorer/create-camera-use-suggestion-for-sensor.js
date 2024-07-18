import { testBrand, testSensor } from "../../../support/commands/equipment-item-browser-utils";

context("Equipment", () => {
  beforeEach(() => {
    cy.server();
    cy.setupInitializationRoutes();
    cy.setupEquipmentDefaultRoutes();
  });

  context("Explorer", () => {
    context("Create camera and use suggestion for sensor", () => {
      it("should start the creation process", () => {
        cy.login();
        cy.visitPage("/equipment/explorer");

        cy.equipmentItemBrowserCreate("#equipment-item-field", "Test", "@findCameras");
      });

      it("should select a brand", () => {
        cy.equipmentItemBrowserSelectFirstBrand("#equipment-item-field-brand", "Test Brand", testBrand);
      });

      it("should create a sensor", () => {
        cy.route("GET", "**/api/v2/equipment/sensor/?page=*", {
          count: 0,
          next: null,
          previous: null,
          results: []
        }).as("findSensors");

        cy.equipmentItemBrowserCreate("#camera-field-sensor", "Test sensor (color)", "@findSensors");

        cy.route("get", "**/api/v2/equipment/sensor/find-similar-in-brand/*", [testSensor]).as("findSimilarSensors");

        cy.equipmentItemBrowserSelectFirstBrand(
          "astrobin-sensor-editor #equipment-item-field-brand",
          "Test Brand",
          testBrand
        );

        cy.get("astrobin-similar-items-suggestion .btn").click();

        cy.equipmentItemBrowserShouldContain("#camera-field-sensor", "Test Brand", "Test sensor (color)");
      });
    });
  });
});
