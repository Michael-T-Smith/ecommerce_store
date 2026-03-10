export function getRequestUser(request) {
  return {
    id   : request.headers.get("x-user-id")    ?? null,
    name : request.headers.get("x-user-name")  ?? null,
    email: request.headers.get("x-user-email") ?? null,
    role : request.headers.get("x-user-role")  ?? "employee",
  };
}