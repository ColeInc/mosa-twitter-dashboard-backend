const CustomAPIError = require("./custom-api");

class UnauthenticatedError extends CustomAPIError {
    constructor(message) {
        super(message);
        this.statusCode = 401;
        console.log(message);
    }
}

module.exports = UnauthenticatedError;
