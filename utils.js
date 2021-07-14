const { validate, Joi } = require("express-validation");

exports.missingKeys = obj => {
  return Object.keys(obj)
    .filter(x => !!!obj[x])
    .join(", ");
};
exports.hasAllKeys = obj => {
  return Object.keys(obj).filter(key =>
    Object.keys(obj)
      .filter(val => obj[val])
      .includes(key)
  );
};
exports.validate = obj => {
  return validate(obj, { keyByField: true }, { abortEarly: false });
};
exports.Joi = Joi;
