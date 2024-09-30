const { test, expect } = require("@playwright/test");
const _ = require("lodash");
const Ajv = require("ajv");
const ajv = new Ajv();

import { userRequestBodyTemplate } from "../../../data/user/create-user-api/create-user-data";
import { CREATE_USER_API,GET_USER_API, DELETE_USER_API } from "../../../src/common/user-config-utils";
import {getLoginInfo, checkTimeout } from "../../../src/common/login-utils";


let token;
let timeout;
let getTokenMoment;

test.beforeAll(async ({ request }) => {
  //Get login token
    ({getTokenMoment,token,timeout} = await checkTimeout(request, getTokenMoment,token,timeout));
});

test.beforeEach(async({request})=>{
    if((new Date().getTime()- getTokenMoment) > timeout){
    ({getTokenMoment,token,timeout} = await checkTimeout(request, getTokenMoment,token,timeout));
    }
});

test("Verify delete user api", async ({request})=>{
    //Create user
    let requestBody = _.cloneDeep(userRequestBodyTemplate); 
    const createUserResponse = await request.post(CREATE_USER_API, {
        headers: {
        Authorization: token,
        },
        data: requestBody,
    });
    const jsonCreateUserResponse = await createUserResponse.json();
    console.log("Create user response:", jsonCreateUserResponse);
    expect(createUserResponse.status()).toBe(200);
    expect(jsonCreateUserResponse.id).toBeDefined();

    //Delete user
    const deleteUserResponse = await request.delete(`${DELETE_USER_API}/${jsonCreateUserResponse.id}`, {
        headers: {
            Authorization: token
        }
    });
    const jsonDeleteUserResponse = await deleteUserResponse.json();
    console.log("Delete user response:", jsonDeleteUserResponse);
    expect(deleteUserResponse.status()).toBe(200);
    //Verify schema => will add later

    //Verify delete user response data
    expect(jsonDeleteUserResponse.message).toEqual("Customer deleted");

    //Double check deleted user
    const getUserResponse = await request.get(
        `${GET_USER_API}/${jsonCreateUserResponse.id}`,
        {
            headers: {
            Authorization: token,
        },
        }
        );
    const jsonGetUserResponse = await getUserResponse.json();
    console.log("Get user response:", jsonGetUserResponse);
    expect(getUserResponse.status()).toBe(404);
    expect(jsonGetUserResponse.message).toEqual("Customer not found");
})