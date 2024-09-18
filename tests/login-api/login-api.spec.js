//body
// validattion: require field, null and empty
// can co cau truc cu the
// tester can tim condition

const { test, expect } = require("@playwright/test");
const Ajv = require("ajv");
const { json } = require("stream/consumers");
const ajv = new Ajv();

const host = "http://localhost";
const port = 3000;
const baseUrl = `${host}:${port}`;

test(`Verify user login successful`, async({request})=>{
    const response = await request.post(`${baseUrl}/api/login`, {
        data:{
        username: "staff",
        password: "1234567890"
        }
    });
    const jsonResponse = await response.json();
    console.log("Login response: ", jsonResponse);
    expect(response.status()).toBe(200);
    //Verify schema
    expect(jsonResponse.token).toBeDefined();
    expect(jsonResponse.timeout).toBe(120000);
});

[
    {
        password: "1234567890"
    },
    {
        username: "",
        password: "1234567890",
    },
    {
        username: "staff",
    },
    {
        username: "staff",
        password: ''
    },   
    {
        username: "mazie",
        password: '1234567890'
    },
    {
        username: "staff",
        password: '52016032002'
    },
    {
        username: "mazie",
        password: '52016032002'
    },
].forEach(requestBody =>{
    test(`Verify user login unsuccessfull with username: ${requestBody.username} password: ${requestBody.password}`, async ({request}) => {
        const response = await request.post(`${baseUrl}/api/login`, {
            data:requestBody
        });
        const jsonResponse = await response.json();
        console.log("Login response: ", jsonResponse);
        expect(response.status()).toBe(401);
        const expectedResponse ={
            "message": "Invalid credentials"
        };
        expect(jsonResponse).toEqual(expectedResponse);
        
    })
})