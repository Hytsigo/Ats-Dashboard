export function getErrorMessage(error: unknown, fallback = "Something went wrong") {
  if (error && typeof error === "object" && "message" in error) {
    const message = (error as { message?: unknown }).message;

    if (typeof message === "string" && message.length > 0) {
      return message;
    }
  }

  return fallback;
}
