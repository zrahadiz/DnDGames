import axios from "axios";

export const getErrorMessage = (error: unknown): string => {
  if (axios.isAxiosError(error)) {
    switch (error.response?.status) {
      case 401:
        return "Unauthorized. Please sign in first.";

      case 403:
        return "You don't have permission to perform this action.";

      case 404:
        return "The requested resource could not be found.";

      case 500:
        return "Something went wrong on our server. Please try again.";

      default:
        return error.response?.data?.message || error.message;
    }
  }

  if (error instanceof Error) {
    return error.message;
  }

  return "Something went wrong. Please try again.";
};
