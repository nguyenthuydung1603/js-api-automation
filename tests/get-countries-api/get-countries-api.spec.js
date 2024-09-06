const { test, expect } = require("@playwright/test");
const Ajv = require("ajv");
const ajv = new Ajv();
const getCountriesJsonSchema = require("../../data/get-countries-api/get-countries-api-json-schema.json");
const getCountriesByFilterSchema = require("../../data/get-countries-by-filter-api/get-countries-by-filter-api-json-schema.json");
const { request } = require("http");
const {
  expectedCountries,
} = require("../../data/get-countries-api/get-countries-expected-response");
const { not } = require("ajv/dist/compile/codegen");
const { notEqual } = require("assert");
const { assert } = require("console");

test.beforeEach(async () => {
  console.log("before each");
});

test.afterEach(async () => {
  console.log("after each");
});

const host = "http://localhost";
const port = 3000;
const baseUrl = `${host}:${port}`;

test("Verify get countries api response schema", async ({ request }) => {
  const url = `${baseUrl}/api/v1/countries`;
  const response = await request.get(url);
  const actualResponseBody = await response.json();
  const validator = ajv.compile(getCountriesJsonSchema);
  const validateResult = validator(actualResponseBody);
  const expectedResponse = {};
  console.log("Validator errors: ", validator.error);
  console.log("API info: ", { url, actualResponseBody, expectedResponse });
  expect(validateResult).toBeTruthy();
  expect(response.status()).toBe(200);
});

test("Verify get countries api return data correctly", async ({ request }) => {
  const url = `${baseUrl}/api/v1/countries`;
  const response = await request.get(url);
  const actualResponseBody = await response.json();
  console.log("Api info: ", {
    url,
    actualResponseBody,
    expectedCountries,
  });
  expect(response.status()).toBe(200);
  expect(actualResponseBody).toEqual(expect.arrayContaining(expectedCountries));
  expect(expectedCountries).toEqual(expect.arrayContaining(actualResponseBody));
});

expectedCountries.forEach((country) => {
  test.describe("Verify get country by code", () => {
    test.beforeEach(async () => {
      console.log("before each specific");
    });
    test(`Verify get countries api return ${country.code} correctly`, async ({
      request,
    }) => {
      const url = `${baseUrl}/api/v1/countries/${country.code}`;
      const response = await request.get(url);
      const actualResponseBody = await response.json();
      console.log("API info: ", { url, actualResponseBody, country });
      expect(response.status()).toBe(200);
      expect(actualResponseBody).toEqual(country);
    });
    test.afterEach(async () => {
      console.log("after each specific");
    });
  });
});

[
  {
    operator: ">",
    gdp: 1000,
    assertion: function (actualGdp) {
      expect(actualGdp).toBeGreaterThan(this.gdp);
    },
  },
  {
    operator: "<",
    gdp: 2000,
    assertion: function (actualGdp) {
      expect(actualGdp).toBeLessThan(this.gdp);
    },
  },
  {
    operator: ">=",
    gdp: 3000,
    assertion: function (actualGdp) {
      expect(actualGdp).toBeGreaterThanOrEqual(this.gdp);
    },
  },
  {
    operator: "<=",
    gdp: 5000,
    assertion: function (actualGdp) {
      expect(actualGdp).toBeLessThanOrEqual(this.gdp);
    },
  },
  {
    operator: "==",
    gdp: 4000,
    assertion: function (actualGdp) {
      expect(actualGdp).toBe(this.gdp);
    },
  },
  {
    operator: "!=",
    gdp: 6000,
    assertion: function (actualGdp) {
      expect(actualGdp).not.toBe(this.gdp);
    },
  },
].forEach((data) => {
  test(`Verify get country by gdp filter ${data.operator} ${data.gdp}`, async ({
    request,
  }) => {
    const url = `${baseUrl}/api/v3/countries`;
    const response = await request.get(url, {
      params: {
        gdp: data.gdp,
        operator: data.operator,
      },
    });
    const actualResponseBody = await response.json();
    actualResponseBody.forEach((item) => {
      data.assertion(item.gdp);
    });
  });
});
