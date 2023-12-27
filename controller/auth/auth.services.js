// const User = require("../../model/user/user.schema");


// //function to add a user
// const createUser = async (
//     {
//         name,
//         email,
//         password,
//         mobile,
//         angle_api_keys,
//         angel_password,
//         angel_totp_token,
//         angel_client_id
//     }
// ) => {
//     return await User.create({
//         name,
//         email,
//         password,
//         mobile,
//         angle_api_keys,
//         angel_password,
//         angel_totp_token,
//         angel_client_id
//     });
// };

// // find user
// const getUser = async obj => {
//     return await User.findOne({
//         where: obj,
//     });
// };

// //get all users
// const getAllUsers = async () => {
//     return await User.findAll({
//         where: { user_type: "USER" },
//     });
// };


// module.exports = { createUser, getUser, getAllUsers }