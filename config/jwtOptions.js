const passportJWT = require('passport-jwt');
let ExtractJwt = passportJWT.ExtractJwt;
let JwtStrategy = passportJWT.Strategy;

let jwtOptions = {};
jwtOptions.jwtFromRequest = ExtractJwt.fromHeader('Authorization');
jwtOptions.secretOrKey = process.env.SECRET_KEY || 'abcdefghijklmnopqrstuvwxyz1234567890';


let strategy = new JwtStrategy(jwtOptions, function (jwt_payload, next) {

    let user = getUser({ id: jwt_payload.id });
    if (user) {
        next(null, user);
    } else {
        next(null, false);
    }
});



module.exports = { jwtOptions, ExtractJwt, JwtStrategy, strategy };