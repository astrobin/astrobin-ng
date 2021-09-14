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

    cy.route("GET", "**/api/v2/equipment/brand/?q=*", {
      count: 0,
      next: null,
      previous: null,
      results: []
    }).as("findBrands");

    cy.route("GET", "**/api/v2/equipment/brand/?name=*", {
      count: 0,
      next: null,
      previous: null,
      results: []
    }).as("findBrandsByName");

    cy.route("GET", /.*\/api\/v2\/equipment\/brand\/\?website=.*/, {
      count: 0,
      next: null,
      previous: null,
      results: []
    }).as("findBrandsByWebsite");

    cy.route("GET", "**/api/v2/equipment/sensor/?q=*", {
      count: 0,
      next: null,
      previous: null,
      results: []
    }).as("findSensors");

    cy.route("GET", "**/api/v2/equipment/sensor/?name=*", {
      count: 1,
      next: null,
      previous: null,
      results: []
    }).as("findSensorsByName");

    cy.route("GET", "**/api/v2/equipment/camera/find-similar-in-brand/*", []);
  });

  context("Explorer", () => {
    context("Create camera with brand/sensor process creation", () => {
      it("should start the creation process", () => {
        cy.visitPage("/equipment/explorer");

        cy.get("#equipment-item-field .ng-input input").type("Test");
        cy.wait("@findCameras");

        cy.get("#equipment-item-field .ng-option").should("have.length", 1);
        cy.get("#equipment-item-field .ng-option:nth-child(1) span span").should("contain", "Create new");
        cy.get("#equipment-item-field .ng-option:nth-child(1) span").should("contain", `"Test"`);
        cy.get("#equipment-item-field .ng-option:nth-child(1)").click();
      });

      it("should create a brand", () => {
        cy.get("#equipment-item-field-brand .ng-input input").type("Test brand");
        cy.wait("@findBrands");

        cy.get("#equipment-item-field-brand .ng-option:nth-child(1) span span").should("contain", "Create new");
        cy.get("#equipment-item-field-brand .ng-option:nth-child(1) span").should("contain", `"Test brand"`);
        cy.get("#equipment-item-field-brand .ng-option:nth-child(1)").click();

        cy.get("#brand-field-name").should("have.value", "Test brand");
        cy.get("#brand-field-website").type("https://www.test-brand.com/");

        cy.route("POST", "**/api/v2/equipment/brand/", testBrand).as("createBrand");
        cy.route("GET", "**/api/v2/equipment/brand/1/", testBrand);

        cy.get("#create-new-brand .btn-primary").click();

        cy.wait("@createBrand");

        cy.get("#equipment-item-field-brand .ng-value").should("contain", "Test brand");
      });

      it("should have prefilled the name", () => {
        cy.get("#equipment-item-field-name").should("have.value", "Test");
      });

      it("should fill the type", () => {
        cy.get("#camera-field-type .ng-input input").click();
        cy.get("#camera-field-type .ng-option:nth-child(1)").click();
        cy.get("#camera-field-type .ng-value").should("contain", "Dedicated deep-sky camera");
      });

      it("should create a sensor", () => {
        cy.get("#camera-field-sensor .ng-input input").type("Test sensor");
        cy.wait("@findSensors");
        cy.get("#camera-field-sensor .ng-option").should("have.length", 1);
        cy.get("#camera-field-sensor .ng-option:nth-child(1) span span").should("contain", "Create new");
        cy.get("#camera-field-sensor .ng-option:nth-child(1) span").should("contain", `"Test sensor"`);
        cy.get("#camera-field-sensor .ng-option:nth-child(1)").click();

        // CREATE SENSOR BRAND
        cy.get("#create-new-sensor #equipment-item-field-brand .ng-input input").type("Test brand");
        cy.wait("@findBrands");

        cy.get("#create-new-sensor #equipment-item-field-brand .ng-option:nth-child(1) span span").should(
          "contain",
          "Create new"
        );
        cy.get("#create-new-sensor #equipment-item-field-brand .ng-option:nth-child(1) span").should(
          "contain",
          `"Test brand"`
        );
        cy.get("#create-new-sensor #equipment-item-field-brand .ng-option:nth-child(1)").click();

        cy.get("#create-new-sensor #brand-field-name").should("have.value", "Test brand");
        cy.get("#create-new-sensor #brand-field-website").type("https://www.test-brand.com/");

        cy.route("POST", "**/api/v2/equipment/brand/", testBrand).as("createBrand");
        cy.route("GET", "**/api/v2/equipment/brand/1/", testBrand);

        cy.get("#create-new-sensor #create-new-brand .btn-primary").click();

        cy.wait("@createBrand");

        cy.get("#create-new-sensor #equipment-item-field-brand .ng-value").should("contain", "Test brand");
        // END CREATE SENSOR BRAND

        cy.get("#create-new-sensor #equipment-item-field-name").should("have.value", "Test sensor");

        cy.route("POST", "**/api/v2/equipment/sensor/", testSensor).as("createSensor");
        cy.route("GET", "**/api/v2/equipment/sensor/find-similar-in-brand/*", []);
        cy.route("GET", "**/api/v2/equipment/brand/1/", testBrand);

        cy.get("#create-new-sensor .btn-primary").click();

        cy.wait("@createSensor");

        cy.get("#camera-field-sensor .ng-value").should("contain", "Test sensor");
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

        cy.get(".modal astrobin-equipment-item-summary .label strong").should("contain", "Test brand");
        cy.get(".modal astrobin-equipment-item-summary .label").should("contain", "Test");
        cy.get(".modal astrobin-equipment-item-summary .property")
          .contains("Class")
          .find("+.property-value")
          .should("contain", "Camera");
        cy.get(".modal astrobin-equipment-item-summary .property")
          .contains("Type")
          .find("+.property-value")
          .should("contain", "Dedicated deep-sky camera");
        cy.get(".modal astrobin-equipment-item-summary .property")
          .contains("Cooled")
          .find("+.property-value")
          .should("contain", "Yes");
        cy.get(".modal astrobin-equipment-item-summary .property")
          .contains("Max. cooling")
          .find("+.property-value")
          .should("contain", "20 °C");
        cy.get(".modal astrobin-equipment-item-summary .property")
          .contains("Back focus")
          .find("+.property-value")
          .should("contain", "20 mm");

        cy.get(".modal-footer .btn-danger").click();

        cy.wait("@createCamera");

        cy.get("#equipment-item-field .ng-value").should("contain", "Test brand Test");
      });
    });
  });
});
