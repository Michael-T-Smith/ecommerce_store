import bcrypt                      from "bcryptjs";
import pool                        from "@/lib/db";
import { getServerUser }           from "@/lib/getRequestUser";
import { canDo }                   from "@/lib/permissions";
import { okList, created, badRequest, forbidden, serverError } from "@/lib/apiHelpers";

export async function GET(request) {
  try {
    const user = await getServerUser();
    if (!user)                                  return forbidden("Not authenticated.");
    if (!canDo(user.role, "employees", "read")) return forbidden();

    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status");

    const conditions = status ? ["status = $1"] : [];
    const params     = status ? [status] : [];

    const where  = conditions.length ? `WHERE ${conditions.join(" AND ")}` : "";
    const result = await pool.query(
      // Never return password_hash to the client
      `SELECT id, name, email, phone, role, status, hire_date, created_at, updated_at
       FROM employees ${where} ORDER BY hire_date ASC`,
      params
    );

    return okList(result.rows, result.rowCount);
  } catch (err) {
    return serverError(err, "GET /api/employees");
  }
}

export async function POST(request) {
  try {
    const user = await getServerUser();
    if (!user)                                    return forbidden("Not authenticated.");
    if (!canDo(user.role, "employees", "create")) return forbidden();

    const body = await request.json();
    const { name, email, phone, role, hireDate, password } = body;

    if (!name || !email) return badRequest("name and email are required.");

    const passwordHash = password ? await bcrypt.hash(password, 12) : null;

    const result = await pool.query(
      `INSERT INTO employees (name, email, phone, role, hire_date, password_hash)
       VALUES ($1,$2,$3,$4,$5,$6)
       RETURNING id, name, email, phone, role, status, hire_date, created_at`,
      [
        name.trim(), email.trim().toLowerCase(), phone || null,
        role || "employee",
        hireDate || new Date().toISOString().split("T")[0],
        passwordHash,
      ]
    );

    return created(result.rows[0]);
  } catch (err) {
    if (err.code === "23505") return badRequest("An employee with that email already exists.");
    return serverError(err, "POST /api/employees");
  }
}