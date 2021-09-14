context("Equipment", () => {
  const testBrand = {
    id: 1,
    deleted: null,
    created: "2021-09-12T08:09:23.625390",
    updated: "2021-09-12T08:09:23.625437",
    name: "Test brand",
    website: "https://www.test-brand.com",
    logo: null,
    createdBy: 1
  };

  const testSensor = {
    id: 1,
    deleted: null,
    reviewedTimestamp: null,
    reviewerDecision: null,
    reviewerRejectionReason: null,
    reviewerComment: null,
    created: "2021-09-14T10:56:10.388669",
    updated: "2021-09-14T10:56:10.388688",
    name: "Test sensor",
    image: null,
    quantumEfficiency: null,
    pixelSize: null,
    pixelWidth: null,
    pixelHeight: null,
    sensorWidth: null,
    sensorHeight: null,
    fullWellCapacity: null,
    readNoise: null,
    frameRate: null,
    adc: null,
    colorOrMono: null,
    createdBy: 1,
    reviewedBy: null,
    brand: 1
  };

  const testCamera = {
    id: 1,
    deleted: null,
    reviewedTimestamp: null,
    reviewerDecision: null,
    reviewerRejectionReason: null,
    reviewerComment: null,
    created: "2021-09-12T08:09:58.508643",
    updated: "2021-09-12T08:09:58.508679",
    name: "Test",
    image: null,
    type: "DEDICATED_DEEP_SKY",
    cooled: true,
    maxCooling: null,
    backFocus: null,
    createdBy: 1,
    reviewedBy: null,
    brand: 1,
    sensor: 1
  };

  beforeEach(() => {
    cy.server();
    cy.setupInitializationRoutes();

    cy.route("GET", "**/api/v2/equipment/camera/?q=*", {
      count: 1,
      next: null,
      previous: null,
      results: []
    }).as("findCameras");

    cy.route("GET", "**/api/v2/equipment/camera/?name=*", {
      count: 1,
      next: null,
      previous: null,
      results: []
    }).as("findCamerasByName");
  });

  context("Explorer", () => {
    context("Create camera with no brand/sensor process", () => {
      it("should start the creation process", () => {
        cy.login();
        cy.visitPage("/equipment/explorer");

        cy.equipmentItemBrowserCreate("#equipment-item-field", "Test", "@findCameras");
      });

      it("should select a brand", () => {
        cy.equipmentItemBrowserSelectNthBrand("#equipment-item-field-brand", "Test brand", testBrand);
      });

      it("should have prefilled the name", () => {
        cy.get("#equipment-item-field-name").should("have.value", "Test");
      });

      it("should fill the type", () => {
        cy.ngSelectOpen("#camera-field-type");
        cy.ngSelectOptionClick("#camera-field-type", 1);
        cy.ngSelectValueShouldContain("#camera-field-type", "Dedicated deep-sky camera");
      });

      it("should select a sensor", () => {
        cy.equipmentItemBrowserSelectNthSensor("#camera-field-sensor", "Test sensor", testSensor);
      });

      it("should show 'Max cooling' only if 'Cooled'", () => {
        cy.get("#camera-field-max-cooling").should("not.be.visible");
        cy.get("label[for=camera-field-cooled]").click();
        cy.get("#camera-field-max-cooling").should("be.visible");
        cy.get("#camera-field-max-cooling").type("20");
      });

      it("should input the 'Back focus'", () => {
        cy.get("#camera-field-back-focus").type("20");
      });

      it("should create the item", () => {
        cy.route("POST", "**/api/v2/equipment/camera/", testCamera).as("createCamera");

        cy.get("#create-new-item .btn-primary").click();

        cy.get(".modal-title")
          .contains("Confirm item creation")
          .should("be.visible");

        cy.equipmentItemSummaryShouldHaveItem(".modal", "Test brand", "Test");
        cy.equipmentItemSummaryShouldHaveProperty(".modal", "Class", "Camera");
        cy.equipmentItemSummaryShouldHaveProperty(".modal", "Type", "Dedicated deep-sky camera");
        cy.equipmentItemSummaryShouldHaveProperty(".modal", "Cooled", "Yes");
        cy.equipmentItemSummaryShouldHaveProperty(".modal", "Max. cooling", "20 °C");
        cy.equipmentItemSummaryShouldHaveProperty(".modal", "Back focus", "20 mm");

        cy.get(".modal-footer .btn-danger").click();

        cy.wait("@createCamera");

        cy.ngSelectValueShouldContain("#equipment-item-field", "Test brand Test");
      });
    });
  });
});
