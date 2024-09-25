const { test, expect } = require("@playwright/test");
const _ = require("lodash");
const Ajv = require("ajv");
const ajv = new Ajv();

import { userRequestBodyTemplate } from "../../../data/user/create-user-api/create-user-data";
import { CREATE_USER_API, GET_USER_API, DELETE_USER_API, UPDATE_USER_API } from "../../../src/common/user-config-utils";
// import { LOGIN_API } from "../../../src/common/login-utils";
import { knex } from "../../../src/common/database-utils";
import {checkTimeout } from "../../../src/common/login-utils";

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

test("Verify user update successfully", async ({request})=>{
    let requestBody = _.cloneDeep(userRequestBodyTemplate); 
//Create user
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

//Take snapshot for current user data
const getCreatedUserResponse = await request.get(`${GET_USER_API}/${jsonCreateUserResponse.id}`,{
    headers: {
        Authorization: token,
    },
}
);
const jsonGetCreatedUserResponse = await getCreatedUserResponse.json();
console.log("Get user response:", jsonGetCreatedUserResponse);
expect(getCreatedUserResponse.status()).toBe(200);

//Update user
let updateUSerRequestBody = _.cloneDeep(requestBody)
// Modify a little bit data
updateUSerRequestBody.firstName = "ahihi";
updateUSerRequestBody.lastName = "ahihi";
const updateUserResponse = await request.put(`${UPDATE_USER_API}/${jsonCreateUserResponse.id}`, {
    headers: {
        Authorization: token,
    },
    data: updateUSerRequestBody
});
const jsonUpdateUserResponse = await updateUserResponse.json();
console.log("Update user response:", jsonUpdateUserResponse);
expect(updateUserResponse.status()).toBe(200);
//Verify schema => tu lam

//Verify update user response data
const expectedUpdateResponse ={
    id: jsonCreateUserResponse.id,
    message: "Customer updated"
}
expect(jsonUpdateUserResponse).toEqual(expectedUpdateResponse);
//Get edited user data
const getUpdatedUserResponse = await request.get(`${GET_USER_API}/${jsonCreateUserResponse.id}`,{
    headers: {
        Authorization: token,
    },
}
);
const jsonGetUpdatedUserResponse = await getUpdatedUserResponse.json();
console.log("Get updated user response:", jsonGetUpdatedUserResponse);
expect(getUpdatedUserResponse.status()).toBe(200);
//Verify what should be changed
expect(jsonGetUpdatedUserResponse.firstName).toBe(updateUSerRequestBody.firstName);
expect(jsonGetUpdatedUserResponse.lastName).toBe(updateUSerRequestBody.lastName);
expect(new Date(jsonGetUpdatedUserResponse.updatedAt).getTime()).toBeGreaterThan(new Date(jsonGetCreatedUserResponse.updatedAt).getTime());
//Verify what should NOT be changed
jsonGetCreatedUserResponse.firstName = updateUSerRequestBody.firstName;
jsonGetCreatedUserResponse.lastName = updateUSerRequestBody.lastName;
jsonGetCreatedUserResponse.updateAt = expect.anything();
// Trong truong hop thuc te, neu ko change address -> no se ko change createdDate, updatedDate, id.....

// expect(jsonGetUpdatedUserResponse).toEqual(expect.objectContaining(jsonGetCreatedUserResponse));

//Clean up data
await request.delete(`${DELETE_USER_API}/${jsonCreateUserResponse.id}`, {
    headers: {
        Authorization: token,
    },
    });
});


