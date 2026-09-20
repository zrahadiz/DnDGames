import axios from "axios";

export const getErrorMessage = (error: unknown): string => {
  if (axios.isAxiosError(error)) {
    const serverMessage = error.response?.data?.message;

    switch (error.response?.status) {
      case 400:
        return serverMessage || "Invalid request.";

      case 401:
        return serverMessage || "Unauthorized. Please sign in first.";

      case 403:
        return serverMessage || "You don't have permission to do that.";

      case 404:
        return serverMessage || "The requested resource could not be found.";

      case 429:
        return (
          serverMessage ||
          "You're doing that too quickly. Please try again shortly."
        );

      case 500:
        return (
          serverMessage ||
          "Something went wrong on our server. Please try again."
        );

      default:
        return serverMessage || error.message;
    }
  }

  if (error instanceof Error) {
    return error.message;
  }

  return "Something went wrong. Please try again.";
};
