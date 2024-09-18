const { test, expect } = require("@playwright/test");
const _ = require('lodash');

const Ajv = require("ajv");
const { request } = require("http");
// const { request } = require("http");
// const { json } = require("stream/consumers");
const ajv = new Ajv();

const host = "http://localhost";
const port = 3000;
const baseUrl = `${host}:${port}`;

[
  {
    testCaseName: "Verify create user successful with single address",
    requestBody: {
      firstName: "Mazie",
      lastName: "Nguyen",
      middleName: "Thuy",
      birthday: "01-23-2000",
      email: `auto_api_${new Date().getTime()}@abc.com`,
      phone: "0123456716",
      addresses: [
        {
          streetNumber: "123",
          street: "Main St",
          ward: "Ward 1",
          district: "District 1",
          city: "Thu Duc",
          state: "Ho Chi Minh",
          zip: "70000",
          country: "VN"
        }
      ]
    },  
  },
  {
    
      testCaseName: "Verify create user successful with multiple address",
      requestBody: {
        firstName: "Mazie",
        lastName: "Nguyen",
        middleName: "Thuy",
        birthday: "01-23-2000",
        email: `auto_api_${new Date().getTime()}@abc.com`,
        phone: "0123456716",
        addresses: [
          {
            streetNumber: "123",
            street: "Main St",
            ward: "Ward 1",
            district: "District 1",
            city: "Thu Duc",
            state: "Ho Chi Minh",
            zip: "70000",
            country: "VN"
          },
          {
            streetNumber: "123",
            street: "Main St",
            ward: "Ward 1",
            district: "District 1",
            city: "Thu Duc",
            state: "Ho Chi Minh",
            zip: "70000",
            country: "VN"
          }
        ]
      }
  }
].forEach(({testCaseName, requestBody})=>{
  test(testCaseName, async ({request})=>{
    //Get login token
    const loginResponse = await request.post(`${baseUrl}/api/login`, {
        data:{
            username: "staff",
            password: "1234567890"
        }
    });
    const jsonLoginResponse = await loginResponse.json();
    console.log("Login response: ", jsonLoginResponse);
    expect(loginResponse.status()).toBe(200);
    expect(jsonLoginResponse.token).toBeDefined();

      const timeBeforeCreateCustomer= new Date();
      const createUserResponse = await request.post(`${baseUrl}/api/user`,
        {
            headers:{
                Authorization: `Bearer ${jsonLoginResponse.token}`
            },
            data: requestBody
        }
      );
      const jsonCreateUserResponse = await createUserResponse.json();
      console.log("Create user response:", jsonCreateUserResponse);
      expect(createUserResponse.status()).toBe(200);
      //verify schema
      expect(jsonCreateUserResponse.id).toBeDefined();
      expect(jsonCreateUserResponse.message).toEqual("Customer created");

      //Double check created user
      const getUserResponse = await request.get(`${baseUrl}/api/user/${jsonCreateUserResponse.id}`,{
        headers:{
          Authorization:`Bearer ${jsonLoginResponse.token}`
        }
      });
      const jsonGetUserResponse = await getUserResponse.json();
      console.log("Get user response:", jsonGetUserResponse);

      expect(getUserResponse.status()).toBe(200);
      const jsonExpectedGetUser= _.cloneDeep(requestBody);
      jsonExpectedGetUser.id = jsonCreateUserResponse.id;
      jsonExpectedGetUser.createdAt = expect.any(String);
      jsonExpectedGetUser.updatedAt = expect.any(String);
      for(let i =0; i <jsonExpectedGetUser.addresses.length; i++){
        jsonExpectedGetUser.addresses[i].customerId = jsonCreateUserResponse.id;
        jsonExpectedGetUser.addresses[i].id = expect.any(String);
        jsonExpectedGetUser.addresses[i].createdAt = expect.any(String);
        jsonExpectedGetUser.addresses[i].updatedAt = expect.any(String);
      }
      expect(jsonGetUserResponse).toEqual(expect.objectContaining(jsonExpectedGetUser));

      //Verify date time
      verifyDateTime(timeBeforeCreateCustomer,jsonGetUserResponse.createdAt);
      verifyDateTime(timeBeforeCreateCustomer,jsonGetUserResponse.updatedAt);
      verifyDateTime(timeBeforeCreateCustomer,jsonGetUserResponse.addresses[0].updatedAt);
      verifyDateTime(timeBeforeCreateCustomer,jsonGetUserResponse.addresses[0].updatedAt);


      //Clean up data
      await request.delete(`${baseUrl}/api/user/${jsonCreateUserResponse.id}`,{
        headers:{
             Authorization: `Bearer ${jsonLoginResponse.token}`
        }
      });
});
})

test("Verify create user successful ", async ({request})=>{
    //Get login token
    const loginResponse = await request.post(`${baseUrl}/api/login`, {
        data:{
            username: "staff",
            password: "1234567890"
        }
    });
    const jsonLoginResponse = await loginResponse.json();
    console.log("Login response: ", jsonLoginResponse);
    expect(loginResponse.status()).toBe(200);
    expect(jsonLoginResponse.token).toBeDefined();

    //Create user
    let randomEmail = `auto_api_${new Date().getTime()}@abc.com`;
    const requestBody ={
        firstName: "Mazie",
        lastName: "Nguyen",
        middleName: "Thuy",
        birthday: "01-23-2000",
        email: randomEmail,
        phone: "0123456716",
        addresses: [
          {
            streetNumber: "123",
            street: "Main St",
            ward: "Ward 1",
            district: "District 1",
            city: "Thu Duc",
            state: "Ho Chi Minh",
            zip: "70000",
            country: "VN"
          }
        ]
      };

      const timeBeforeCreateCustomer= new Date();
      const createUserResponse = await request.post(`${baseUrl}/api/user`,
        {
            headers:{
                Authorization: `Bearer ${jsonLoginResponse.token}`
            },
            data: requestBody
        }
      );
      const jsonCreateUserResponse = await createUserResponse.json();
      console.log("Create user response:", jsonCreateUserResponse);
      expect(createUserResponse.status()).toBe(200);
      //verify schema
      expect(jsonCreateUserResponse.id).toBeDefined();
      expect(jsonCreateUserResponse.message).toEqual("Customer created");

      //Double check created user
      const getUserResponse = await request.get(`${baseUrl}/api/user/${jsonCreateUserResponse.id}`,{
        headers:{
          Authorization:`Bearer ${jsonLoginResponse.token}`
        }
      });
      const jsonGetUserResponse = await getUserResponse.json();
      console.log("Get user response:", jsonGetUserResponse);

      expect(getUserResponse.status()).toBe(200);
      const jsonExpectedGetUser= _.cloneDeep(requestBody);
      jsonExpectedGetUser.id = jsonCreateUserResponse.id;
      jsonExpectedGetUser.createdAt = expect.any(String);
      jsonExpectedGetUser.updatedAt = expect.any(String);
      for(let i =0; i <jsonExpectedGetUser.addresses.length; i++){
        jsonExpectedGetUser.addresses[i].customerId = jsonCreateUserResponse.id;
        jsonExpectedGetUser.addresses[i].id = expect.any(String);
        jsonExpectedGetUser.addresses[i].createdAt = expect.any(String);
        jsonExpectedGetUser.addresses[i].updatedAt = expect.any(String);
      }
      expect(jsonGetUserResponse).toEqual(expect.objectContaining(jsonExpectedGetUser));

      //Verify date time
      verifyDateTime(timeBeforeCreateCustomer,jsonGetUserResponse.createdAt);
      verifyDateTime(timeBeforeCreateCustomer,jsonGetUserResponse.updatedAt);
      verifyDateTime(timeBeforeCreateCustomer,jsonGetUserResponse.addresses[0].updatedAt);
      verifyDateTime(timeBeforeCreateCustomer,jsonGetUserResponse.addresses[0].updatedAt);


      //Clean up data
      await request.delete(`${baseUrl}/api/user/${jsonCreateUserResponse.id}`,{
        headers:{
             Authorization: `Bearer ${jsonLoginResponse.token}`
        }
      });
});

test("Verify create user successful with multiple address_ ", async ({request})=>{
  //Get login token
  const loginResponse = await request.post(`${baseUrl}/api/login`, {
      data:{
          username: "staff",
          password: "1234567890"
      }
  });
  const jsonLoginResponse = await loginResponse.json();
  console.log("Login response: ", jsonLoginResponse);
  expect(loginResponse.status()).toBe(200);
  expect(jsonLoginResponse.token).toBeDefined();

  //Create user
  let randomEmail = `auto_api_${new Date().getTime()}@abc.com`;
  const requestBody ={
      firstName: "Mazie",
      lastName: "Nguyen",
      middleName: "Thuy",
      birthday: "01-23-2000",
      email: randomEmail,
      phone: "0123456716",
      addresses: [
        {
          streetNumber: "123",
          street: "Main St",
          ward: "Ward 1",
          district: "District 1",
          city: "Thu Duc",
          state: "Ho Chi Minh",
          zip: "70000",
          country: "VN"
        },
        {
          streetNumber: "123",
          street: "Main St",
          ward: "Ward 1",
          district: "District 1",
          city: "Thu Duc",
          state: "Ho Chi Minh",
          zip: "70000",
          country: "VN"
        }
      ]
    };

    const timeBeforeCreateCustomer= new Date();
    const createUserResponse = await request.post(`${baseUrl}/api/user`,
      {
          headers:{
              Authorization: `Bearer ${jsonLoginResponse.token}`
          },
          data: requestBody
      }
    );
    const jsonCreateUserResponse = await createUserResponse.json();
    console.log("Create user response:", jsonCreateUserResponse);
    expect(createUserResponse.status()).toBe(200);
    //verify schema
    expect(jsonCreateUserResponse.id).toBeDefined();
    expect(jsonCreateUserResponse.message).toEqual("Customer created");

    //Double check created user
    const getUserResponse = await request.get(`${baseUrl}/api/user/${jsonCreateUserResponse.id}`,{
      headers:{
        Authorization:`Bearer ${jsonLoginResponse.token}`
      }
    });
    const jsonGetUserResponse = await getUserResponse.json();
    console.log("Get user response:", jsonGetUserResponse);

    expect(getUserResponse.status()).toBe(200);
    const jsonExpectedGetUser= _.cloneDeep(requestBody);
    jsonExpectedGetUser.id = jsonCreateUserResponse.id;
    jsonExpectedGetUser.createdAt = expect.any(String);
    jsonExpectedGetUser.updatedAt = expect.any(String);

    for(let i =0; i <jsonExpectedGetUser.addresses.length; i++){
      jsonExpectedGetUser.addresses[i].customerId = jsonCreateUserResponse.id;
      jsonExpectedGetUser.addresses[i].id = expect.any(String);
      jsonExpectedGetUser.addresses[i].createdAt = expect.any(String);
      jsonExpectedGetUser.addresses[i].updatedAt = expect.any(String);
    }

    expect(jsonGetUserResponse).toEqual(expect.objectContaining(jsonExpectedGetUser));

    //Verify date time
    verifyDateTime(timeBeforeCreateCustomer,jsonGetUserResponse.createdAt);
    verifyDateTime(timeBeforeCreateCustomer,jsonGetUserResponse.updatedAt);
    verifyDateTime(timeBeforeCreateCustomer,jsonGetUserResponse.addresses[0].updatedAt);
    verifyDateTime(timeBeforeCreateCustomer,jsonGetUserResponse.addresses[0].updatedAt);


    //Clean up data
    await request.delete(`${baseUrl}/api/user/${jsonCreateUserResponse.id}`,{
      headers:{
           Authorization: `Bearer ${jsonLoginResponse.token}`
      }
    });
});

function verifyDateTime(timeBeforeCreateCustomer, actual  ){
  const actualDateTime = new Date(actual);
  expect(actualDateTime.getTime()).toBeGreaterThan(timeBeforeCreateCustomer.getTime());
  expect(actualDateTime.getTime()).toBeLessThan(new Date().getTime());

}