const validate = (schema) => (req, res, next) => {
  for (const part of ['body', 'params', 'query']) {
    const partSchema = schema && schema[part];
    if (!partSchema) continue;

    const result = partSchema.safeParse(req[part]);

    if (!result.success) {
      return res.status(400).json({
        message: 'Invalid request data',
        errors: result.error.flatten(),
      });
    }

    req[part] = result.data;
  }

  next();
};

module.exports = validate;
