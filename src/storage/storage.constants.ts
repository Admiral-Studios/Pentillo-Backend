export const S3_CLIENT = 'S3_CLIENT';

export const SWAGGER_FILE_SCHEMA = {
  schema: {
    type: 'object',
    required: ['file'],
    properties: {
      file: {
        type: 'file',
        format: 'binary',
      },
    },
  },
};

export const SWAGGER_FILES_SCHEMA = {
  schema: {
    type: 'object',
    required: ['file', 'listId'],
    properties: {
      file: {
        type: 'file',
        format: 'binary',
      },
      note: { type: 'string' },
      listId: { type: 'string' },
      name: { type: 'string' },
    },
  },
};

export const SWAGGER_UPDATE_FILES_SCHEMA = {
  schema: {
    type: 'object',
    required: ['listId'],
    properties: {
      file: {
        type: 'file',
        format: 'binary',
      },
      note: { type: 'string' },
      listId: { type: 'string' },
      name: { type: 'string' },
    },
  },
};
