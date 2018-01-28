const Error = require('../helpers/error');

const HTTP_ERRORS = {
  AUTH: {
    NOT_AUTHORIZED: new Error('NOT_AUTHORIZED', 'Not authorized.', 401),
    ACCESS_DENIED: new Error('ACCESS_DENIED', 'Access is denied.', 403),
    EMAIL_NOT_FOUND: new Error('EMAIL_NOT_FOUND', 'The email you provided is not registered.', 400),
  },
  GENERAL: {
    ID_NOT_VALID: new Error('ID_NOT_VALID', 'The ID you provided is not valid.', 400),
    VALIDATION: new Error('VALIDATION_ERROR', '', 400),
    NOT_FOUND: new Error('NOT_FOUND', 'The reseource you are looking for is not found.', 404),
    EXISTS: new Error('ALREADY_EXISTS', 'The reseource you are trying to add is exists.', 409),
    DB: new Error('DB_ERROR', 'Internal error occurred', 500),
  }
};

module.exports = HTTP_ERRORS;
