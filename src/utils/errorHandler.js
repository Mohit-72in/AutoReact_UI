/**
 * Centralized error handling utility
 */

export class APIError extends Error {
  constructor(message, status, data) {
    super(message);
    this.name = 'APIError';
    this.status = status;
    this.data = data;
  }
}

export const handleAPIError = (error) => {
  if (error.response) {
    // Server responded with error
    const { status, data } = error.response;
    const message = data?.message || data?.error || 'An error occurred';
    throw new APIError(message, status, data);
  } else if (error.request) {
    // Request made but no response
    throw new APIError('No response from server. Please check your connection.', 0);
  } else {
    // Something else happened
    throw new APIError(error.message || 'An unexpected error occurred', -1);
  }
};

export const logError = (error, context = '') => {
  console.error(`[Error${context ? ` - ${context}` : ''}]:`, {
    message: error.message,
    stack: error.stack,
    ...(error instanceof APIError && {
      status: error.status,
      data: error.data,
    }),
  });
};

export const getErrorMessage = (error) => {
  if (error instanceof APIError) {
    return error.message;
  }
  if (error instanceof Error) {
    return error.message;
  }
  return 'An unexpected error occurred. Please try again.';
};
