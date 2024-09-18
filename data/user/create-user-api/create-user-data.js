export const userRequestBodyTemplate ={
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
  }