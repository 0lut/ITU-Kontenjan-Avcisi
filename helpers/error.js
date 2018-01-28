class AppError extends Error {
  constructor(alias, msg, status = 500) {
    super(msg);
    this.name = this.constructor.name;
    this.alias = alias;
    this.message = msg;
    this.messages = {};
    this.status = status;

    if (typeof Error.captureStackTrace === 'function') {
      Error.captureStackTrace(this, this.constructor);
    } else {
      this.stack = new Error(msg).stack;
    }
  }

  setValidationMessages(errorObject) {
    if (errorObject.errors) {
      Object.keys(errorObject.errors).forEach((error) => {
        this.messages[error] = errorObject.errors[error].message;
      });
    }
    return this;
  }
}

module.exports = AppError;
