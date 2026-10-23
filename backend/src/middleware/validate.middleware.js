// Zod strips untrusted fields (or rejects them for strict schemas) before controllers.
export function validate(schema) {
  return (req, res, next) => {
    req.validated = schema.parse(req.body);
    next();
  };
}
