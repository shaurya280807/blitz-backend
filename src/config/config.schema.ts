import * as Joi from 'joi';

export const configValidationSchema = Joi.object({
  NODE_ENV: Joi.string().valid('development', 'production', 'test').default('development'),
  PORT: Joi.number().default(3001),
  MONGODB_URI: Joi.string().required(),
  JWT_SECRET: Joi.string().min(32).required(),
  JWT_EXPIRATION: Joi.string().default('24h'),
  ADMIN_USERNAME: Joi.string().optional(),
  ADMIN_PASSWORD: Joi.string().optional(),
  CORS_ORIGINS: Joi.string().optional(),
  UPLOADS_DIR: Joi.string().default('uploads'),
});
