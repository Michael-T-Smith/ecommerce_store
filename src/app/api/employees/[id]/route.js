import bcrypt                      from "bcryptjs";
import pool                        from "@/lib/db";
import { getServerUser }           from "@/lib/getRequestUser";
import { canDo }                   from "@/lib/permissions";
import { ok, badRequest, forbidden, notFound, serverError } from "@/lib/apiHelpers";

export async function PATCH(request, { params }) {
  try {
    const user = await getServerUser();
    if (!user)                                    return forbidden("Not authenticated.");
    if (!canDo(user.role, "employees", "update")) return forbidden();

    const { id }   = await params;
    const body = await request.json();

    const ALLOWED      = ["name","email","phone","role","status","hire_date"];
    const camelToSnake = { hireDate:"hire_date" };

    const sets = [], values = [];
    let   p    = 1;

    for (const [key, val] of Object.entries(body)) {
      if (key === "password" && val) {
        sets.push(`password_hash = $${p++}`);
        values.push(await bcrypt.hash(val, 12));
        continue;
      }
      const col = camelToSnake[key] ?? key;
      if (ALLOWED.includes(col)) { sets.push(`${col} = $${p++}`); values.push(val); }
    }

    if (!sets.length) return badRequest("No valid fields provided for update.");

    values.push(id);
    const result = await pool.query(
      `UPDATE employees SET ${sets.join(", ")} WHERE id = $${p}
       RETURNING id, name, email, phone, role, status, hire_date, updated_at`,
      values
    );

    if (result.rowCount === 0) return notFound("Employee not found.");
    return ok(result.rows[0]);
  } catch (err) {
    if (err.code === "23505") return badRequest("An employee with that email already exists.");
    return serverError(err, "PATCH /api/employees/[id]");
  }
}

export async function DELETE(_request, { params }) {
  try {
    const user = await getServerUser();
    if (!user)                                    return forbidden("Not authenticated.");
    if (!canDo(user.role, "employees", "delete")) return forbidden();

    const { id } = await params;

    // Prevent deleting yourself
    if (String(id) === String(user.id))
      return badRequest("You cannot delete your own account.");

    const result = await pool.query(
      "DELETE FROM employees WHERE id = $1 RETURNING id, name",
      [id]
    );

    if (result.rowCount === 0) return notFound("Employee not found.");
    return ok({ deleted: true, id: result.rows[0].id, name: result.rows[0].name });
  } catch (err) {
    return serverError(err, "DELETE /api/employees/[id]");
  }
}