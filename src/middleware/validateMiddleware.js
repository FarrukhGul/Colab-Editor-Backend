const validate = (schema) => (req, res, next) => {
    const result = schema.safeParse(req.body)

    if (!result.success) {
        return res.status(400).json({
            success: false,
            errors: result.error?.errors?.map(e => e.message) || ["Validation failed"]
        })
    }

    req.body = result.data
    next()
}

export default validate