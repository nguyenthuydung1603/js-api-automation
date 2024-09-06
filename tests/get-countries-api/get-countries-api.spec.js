const { test, expect } = require("@playwright/test");
const Ajv = require("ajv");
const ajv = new Ajv();
const getCountriesJsonSchema = require("../../data/get-countries-api/get-countries-api-json-schema.json");
const getCountriesByFilterSchema = require("../../data/get-countries-by-filter-api/get-countries-by-filter-api-json-schema.json")
const { request } = require("http");
const {
  expectedCountries,
} = require("../../data/get-countries-api/get-countries-expected-response");

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

test(`Verify get country by gdp filter greater than 5000`, async ({request}) => {
  const url = `${baseUrl}/api/v3/countries`;
  const response = await request.get(url,{
    params:{
      gdp: 5000,
      operator:'>'
    }
  });
  const actualResponseBody = await response.json();
  actualResponseBody.forEach(item => {
    expect(item.gdp).toBeGreaterThan(5000);
  });


  // const validator = ajv.compile(getCountriesByFilterSchema);
  // const validateResult = validator(actualResponseBody);
  // console.log("Validator errors: ", validator.error);
  // console.log("API info: ", { url, actualResponseBody});
  // expect(validateResult).toBeTruthy();
  // expect(response.status()).toBe(200);

})
