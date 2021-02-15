const Joi = require('@hapi/joi');

const username = Joi.string()
  .min(3)
  .max(100)
  .trim()
  .required()
  .label('Username');
const email = Joi.string()
  .email()
  .min(8)
  .max(254)
  .trim()
  .required()
  .label('Email');
const password = Joi.string()
  .min(6)
  .max(72, 'utf-8')
  .required()
  .label('Password');

module.exports = {
  signupValidator: Joi.object({
    username,
    email,
    password,
  }),
  loginValidator: Joi.object({
    email,
    password,
  }),
};
