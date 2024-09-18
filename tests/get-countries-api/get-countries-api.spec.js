const { test, expect } = require("@playwright/test");
const Ajv = require("ajv");
const ajv = new Ajv();
const getCountriesJsonSchema = require("../../data/get-countries-api/get-countries-api-json-schema.json");
const getCountriesWithPagination = require("../../data/get-countries-with-pagination/get-countries-with-pagination-api-json-schema.json");
const getCountriesWithPrivate = require ("../../data/get-countries-with-private/get-countries-with-private-schema.json");
const getCountriesWithGDP = require("../../data/get-countries-with-gdp-api/get-countries-with-gdp-api-json-schema.json");
const { request } = require("http");
const {expectedCountries} = require("../../data/get-countries-api/get-countries-expected-response");
const {expectedCountriesWithPrivate} = require ("../../data/get-countries-with-private/get-countries-with-private-expected-response");
const {expectedCountriesWithGDP} = require("../../data/get-countries-with-gdp-api/get-countries-with-gdp-expected-response");
const { not } = require("ajv/dist/compile/codegen");
const { notEqual } = require("assert");
const { assert } = require("console");
const exp = require("constants");

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
  test(`Verify get country by gdp filter ${data.operator} ${data.gdp}`, async ({request,}) => {
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

async function getCountriesWithPaginationMethod(request, page, size) {
  const url = `${baseUrl}/api/v4/countries`;
  return await request.get(url, {
    params: {
      page: page,
      size: size,
    },
  });
}

test(`Verify get countries with pagination`, async ({ request }) => {
  let size = 4;
  //Verify first page
  const firstPageResponse = await getCountriesWithPaginationMethod(request,1,size);
  const actualFirstPageResponseBody = await firstPageResponse.json();
  const validator = ajv.compile(getCountriesWithPagination);
  const validateResult = validator(actualFirstPageResponseBody);
  console.log("Validator errors: ", validator.error);
  console.log("First Page API infor: ", {
    actualFirstPageResponseBody: JSON.stringify(actualFirstPageResponseBody),
  });
  expect(firstPageResponse.status()).toBe(200);
  expect(validateResult).toBeTruthy();
  expect(actualFirstPageResponseBody.data.length).toBe(size);

  //Verify second page
  const secondPageResponse = await getCountriesWithPaginationMethod(request,2,size);
  const actualSecondPageResponseBody = await secondPageResponse.json();
  console.log("Second Page API infor: ", {
    actualSecondPageResponseBody: JSON.stringify(actualSecondPageResponseBody),
  });
  expect(secondPageResponse.status()).toBe(200);
  expect(actualSecondPageResponseBody.data.length).toBe(size);
  expect(actualSecondPageResponseBody.data).not.toEqual(
    expect.arrayContaining(actualFirstPageResponseBody.data)
  );

  //Verify last page
  const lastPage = Math.ceil(actualFirstPageResponseBody.total / size);
  const lastPageLength = actualFirstPageResponseBody.total % size;
  const lastPageResponse = await getCountriesWithPaginationMethod(request,lastPage,size);
  const actualLastPageResponseBody = await lastPageResponse.json();
  console.log("Last Page API infor: ", {
    actualLastPageResponseBody: JSON.stringify(actualLastPageResponseBody),
  });
  expect(lastPageResponse.status()).toBe(200);
  expect(actualLastPageResponseBody.data.length).toBe(lastPageLength);

  //Verify last page plus one
  const lastPagePlusResponse = await getCountriesWithPaginationMethod(request,lastPage+1,size);
  const actualLastPagePlusResponseBody = await lastPagePlusResponse.json();
  console.log("Last Page API infor: ", {
    actualLastPagePlusResponseBody: JSON.stringify(actualLastPagePlusResponseBody),
  });
  expect(lastPagePlusResponse.status()).toBe(200);
  expect(actualLastPagePlusResponseBody.data.length).toBe(0);
});


// test hoàn chỉnh cover 4 trường hợp xảy ra: invalid, valid, null, empty

async function getCountriesWithPrivateMethod(request, apiKey) {
  const url = `${baseUrl}/api/v5/countries`;
  return await request.get(url, {
    headers: {
      'api-key': apiKey
    },
  });
}

test(`Verify get countries with header`, async ({request}) =>{
  //valid data
  const response = await getCountriesWithPrivateMethod(request, "private");
  const actualResponseBody = await response.json();
  // console.log(actualResponseBody);
  const validator = ajv.compile(getCountriesWithPrivate);
  const validateResult = validator(actualResponseBody);
  expect(response.status()).toBe(200);
  expect(validateResult).toBeTruthy();
  expect(actualResponseBody).toEqual(expect.arrayContaining(expectedCountriesWithPrivate));
  expect(expectedCountriesWithPrivate).toEqual(expect.arrayContaining(actualResponseBody));

  //invalid data //empty
  const invalidResponse = await getCountriesWithPrivateMethod(request,"invalid");
  const actualInvalidResponseseBody = await invalidResponse.json();
  const invalidValidator = ajv.compile(getCountriesWithGDP);
  const invalidValidateResult = invalidValidator(actualInvalidResponseseBody);
  expect(invalidResponse.status()).toBe(200);
  expect(invalidValidateResult).toBeTruthy();
  expect(actualInvalidResponseseBody).toEqual(expect.arrayContaining(expectedCountriesWithGDP));
  expect(expectedCountriesWithGDP).toEqual(expect.arrayContaining(actualInvalidResponseseBody));

  //null data
  const url = `${baseUrl}/api/v5/countries`;
  const nullHeaderResponse = await request.get(url);
  const actualNullHeaderResponseseBody = await nullHeaderResponse.json();
  const nullHeaderValidator = ajv.compile(getCountriesWithGDP);
  const nullHeaderValidateResult = nullHeaderValidator(actualNullHeaderResponseseBody);
  expect(nullHeaderResponse.status()).toBe(200);
  expect(nullHeaderValidateResult).toBeTruthy();
  expect(actualNullHeaderResponseseBody).toEqual(expect.arrayContaining(expectedCountriesWithGDP));
  expect(expectedCountriesWithGDP).toEqual(expect.arrayContaining(actualNullHeaderResponseseBody));








});

