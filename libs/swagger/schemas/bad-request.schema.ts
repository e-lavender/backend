export const BAD_REQUEST_SCHEMA = {
  type: 'array',
  example: {
    errorsMessages: [
      {
        message: 'string',
        field: 'string',
      },
    ],
  },
};
