export class HttpError extends Error {
  constructor(statusCode, message) {
    super(message);
    this.name = 'HttpError';
    this.statusCode = statusCode;
  }
}

export const assertFound = (document, message) => {
  if (!document) {
    throw new HttpError(404, message);
  }

  return document;
};
