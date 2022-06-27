import { testBrand, testCamera, testSensor } from "../../../support/commands/equipment-item-browser-utils";

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
        cy.equipmentItemBrowserSelectFirstBrand("#equipment-item-field-brand", "Test brand", testBrand);
      });

      it("should create a sensor", () => {
        cy.equipmentItemBrowserCreate("#camera-field-sensor", "Test sensor", "@findSensors");

        cy.route("get", "**/api/v2/equipment/sensor/find-similar-in-brand/*", [testSensor]).as("findSimilarSensors");

        cy.equipmentItemBrowserSelectFirstBrand(
          "astrobin-sensor-editor #equipment-item-field-brand",
          "Test brand",
          testBrand
        );

        cy.get("astrobin-sensor-editor #equipment-item-field-name").clear();
        cy.get("astrobin-sensor-editor #equipment-item-field-name").type("Test sensor");

        cy.wait("@findSimilarSensors");

        cy.get("astrobin-similar-items-suggestion").should("be.visible");
        cy.get("astrobin-similar-items-suggestion .btn").click();

        cy.equipmentItemBrowserShouldContain("#camera-field-sensor", "Test brand", "Test sensor");
      });
    });
  });
});
