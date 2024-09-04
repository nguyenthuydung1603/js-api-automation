const { test, expect } = require("@playwright/test");
const { request } = require("http");
const Ajv = require("ajv");
const ajv = new Ajv();
const getCountriesWithGDPJsonSchema = require("../../data/get-countries-api/get-countries-api-with-gdp-json-schema.json");
const {expectedCountriesWithGDP} = require("../../data/get-countries-api/get-countries-with-gdp-expected-response")

test("Verify getCountriesWithGDP API json schema", async ({ request }) => {
  const url = "http://localhost:3000/api/v2/countries";
  const response = await request.get(url);
  const actualResponseBody = await response.json();
  const validator = ajv.compile(getCountriesWithGDPJsonSchema);
  const validateResult = validator(actualResponseBody);
  expect(validateResult).toBeTruthy();
});

test("Verify getCountriesWithGDP API return data correctly", async ({ request }) => {
  const url = "http://localhost:3000/api/v2/countries";
  const response = await request.get(url);
  const actualResponseBody = await response.json();
  expect(response.status()).toBe(200); 
  expect(actualResponseBody).toEqual(expect.arrayContaining(expectedCountriesWithGDP));
  expect(expectedCountriesWithGDP).toEqual(expect.arrayContaining(actualResponseBody));
});
