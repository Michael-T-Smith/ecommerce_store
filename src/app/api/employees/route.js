// ================================================================
//  FILE: src/app/api/employees/route.js
//
//  GET  /api/employees — list all employees (no password_hash returned)
//  POST /api/employees — create new employee (admin only)
// ================================================================

import bcrypt             from "bcryptjs";
import pool               from "@/lib/db";
import { getRequestUser } from "@/lib/getRequestUser";
import { canDo }          from "@/lib/permissions";
import {
  okList, created, badRequest, forbidden, serverError,
} from "@/lib/apiHelpers";

export async function GET(request) {
  try {
    const user = getRequestUser(request);
    if (!canDo(user.role, "employees", "read")) return forbidden();

    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status");

    const conditions = status ? ["status = $1"] : [];
    const params     = status ? [status]        : [];
    const where      = conditions.length > 0 ? `WHERE ${conditions.join(" AND ")}` : "";

    const result = await pool.query(
      // password_hash is never returned to the client
      `SELECT id, name, email, phone, role, status, hire_date, created_at, updated_at
       FROM employees
       ${where}
       ORDER BY hire_date ASC`,
      params
    );

    return okList(result.rows, result.rowCount);
  } catch (err) {
    return serverError(err, "GET /api/employees");
  }
}

export async function POST(request) {
  try {
    const user = getRequestUser(request);
    if (!canDo(user.role, "employees", "create")) return forbidden();

    const body = await request.json();
    const { name, email, phone, role, hireDate, password } = body;

    if (!name || !email) {
      return badRequest("name and email are required.");
    }

    const passwordHash = password
      ? await bcrypt.hash(password, 12)
      : null;

    const result = await pool.query(
      `INSERT INTO employees (name, email, phone, role, hire_date, password_hash)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING id, name, email, phone, role, status, hire_date, created_at`,
      [
        name.trim(),
        email.trim().toLowerCase(),
        phone    || null,
        role     || "employee",
        hireDate || new Date().toISOString().split("T")[0],
        passwordHash,
      ]
    );

    return created(result.rows[0]);
  } catch (err) {
    if (err.code === "23505") {
      return badRequest("An employee with that email already exists.");
    }
    return serverError(err, "POST /api/employees");
  }
}


// ================================================================
//  FILE: src/app/api/employees/[id]/route.js
//
//  PATCH /api/employees/[id] — update name, phone, role, status,
//                              or reset password (admin only)
// ================================================================

import bcrypt             from "bcryptjs";
import pool               from "@/lib/db";
import { getRequestUser } from "@/lib/getRequestUser";
import { canDo }          from "@/lib/permissions";
import {
  ok, badRequest, forbidden, notFound, serverError,
} from "@/lib/apiHelpers";

export async function PATCH(request, { params }) {
  try {
    const user = getRequestUser(request);
    if (!canDo(user.role, "employees", "update")) return forbidden();

    const id   = parseInt(params.id);
    const body = await request.json();

    const sets   = [];
    const values = [];
    let   p      = 1;

    const ALLOWED_MAP = {
      name    : "name",
      phone   : "phone",
      role    : "role",
      status  : "status",
      hireDate: "hire_date",
    };

    for (const [key, val] of Object.entries(body)) {
      const col = ALLOWED_MAP[key];
      if (col) {
        sets.push(`${col} = $${p++}`);
        values.push(val);
      }
    }

    if (body.password) {
      if (body.password.length < 8) {
        return badRequest("Password must be at least 8 characters.");
      }
      const hash = await bcrypt.hash(body.password, 12);
      sets.push(`password_hash = $${p++}`);
      values.push(hash);
    }

    if (sets.length === 0) return badRequest("No valid fields to update.");

    values.push(id);
    const result = await pool.query(
      `UPDATE employees
       SET ${sets.join(", ")}
       WHERE id = $${p}
       RETURNING id, name, email, phone, role, status, hire_date, updated_at`,
      values
    );

    if (result.rowCount === 0) return notFound("Employee not found.");
    return ok(result.rows[0]);
  } catch (err) {
    return serverError(err, "PATCH /api/employees/[id]");
  }
}