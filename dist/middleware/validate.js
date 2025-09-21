"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validate = void 0;
const validate = (schema) => {
    return (req, res, next) => {
        const result = schema.safeParse({
            params: req.params,
            query: req.query,
            body: req.body,
        });
        if (!result.success) {
            return res.status(400).json({ message: "Validation error", errors: result.error.flatten() });
        }
        req.validated = result.data;
        next();
    };
};
exports.validate = validate;
exports.default = exports.validate;
