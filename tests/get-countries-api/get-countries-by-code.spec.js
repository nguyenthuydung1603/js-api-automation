const { test, expect } = require("@playwright/test");
const { request } = require("http");
const Ajv = require("ajv");
const ajv = new Ajv();
const getCountriesByCodePJsonSchema = require("../../data/get-countries-by-code-api/get-countries-by-code-api-json-schema.json");
const {expectedCountriesByCode} = require("../../data/get-countries-by-code-api/get-countries-by-code-expected-response")

test("Verify getCountriesByCode API json schema", async ({ request }) => {
  const url = "http://localhost:3000/api/v1/countries/VN";
  const response = await request.get(url);
  const actualResponseBody = await response.json();
  const validator = ajv.compile(getCountriesByCodePJsonSchema);
  const validateResult = validator(actualResponseBody);
  expect(validateResult).toBeTruthy();
});

test("Verify getCountriesByCode API return data correctly", async ({ request }) => {
  const url = "http://localhost:3000/api/v1/countries/VN";
  const response = await request.get(url);
  const actualResponseBody = await response.json();
  expect(response.status()).toBe(200); 
  expect(actualResponseBody).toEqual(expect.objectContaining(expectedCountriesByCode));
  expect(expectedCountriesByCode).toEqual(expect.objectContaining(actualResponseBody));
});
