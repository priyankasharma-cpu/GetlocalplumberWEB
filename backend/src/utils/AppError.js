// Only explicitly constructed operational errors expose their message to clients.
export default class AppError extends Error {
  constructor(status, message) {
    super(message);
    this.name = "AppError";
    this.status = status;
  }
}
