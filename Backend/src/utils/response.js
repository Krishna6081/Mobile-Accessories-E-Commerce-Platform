class ApiResponse {
  static success(res, message = 'Success', data = {}, statusCode = 200, meta = null) {
    const payload = {
      success: true,
      message,
      data,
    };
    if (meta) payload.meta = meta;
    return res.status(statusCode).json(payload);
  }

  static error(res, message = 'Internal Server Error', statusCode = 500, errors = null) {
    const payload = {
      success: false,
      message,
    };
    if (errors) payload.errors = errors;
    return res.status(statusCode).json(payload);
  }

  static paginate(res, data, page, limit, total, message = 'Data retrieved successfully') {
    const totalPages = Math.ceil(total / limit);
    return res.status(200).json({
      success: true,
      message,
      data,
      meta: {
        page: Number(page),
        limit: Number(limit),
        total: Number(total),
        totalPages,
      },
    });
  }
}

module.exports = ApiResponse;
