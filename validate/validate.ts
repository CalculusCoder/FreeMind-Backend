export {};
import Joi from 'joi';

const loginSchema = Joi.object({
  email: Joi.string().min(3).max(30).required(),
  password: Joi.string().alphanum().min(5).max(30).required(),
});

export { loginSchema };
