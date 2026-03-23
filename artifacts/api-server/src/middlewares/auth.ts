import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { db, usersTable } from "@workspace/db";
import { eq } from "drizzle-orm";

const rawJwtSecret = process.env.JWT_SECRET;
const rawRefreshSecret = process.env.JWT_REFRESH_SECRET;

if (!rawJwtSecret) {
  if (process.env.NODE_ENV === "production") {
    console.error("FATAL: JWT_SECRET muhit o'zgaruvchisi o'rnatilmagan!");
    process.exit(1);
  }
  console.warn("⚠️  JWT_SECRET not set — using dev fallback. Set it in production!");
}

if (!rawRefreshSecret) {
  if (process.env.NODE_ENV === "production") {
    console.error("FATAL: JWT_REFRESH_SECRET muhit o'zgaruvchisi o'rnatilmagan!");
    process.exit(1);
  }
  console.warn("⚠️  JWT_REFRESH_SECRET not set — using dev fallback. Set it in production!");
}

const JWT_SECRET = rawJwtSecret ?? "pdrc-dev-access-secret-change-in-production";
const JWT_REFRESH_SECRET = rawRefreshSecret ?? "pdrc-dev-refresh-secret-change-in-production";

export interface AuthPayload {
  userId: number;
  email: string;
  role: string;
}

declare global {
  namespace Express {
    interface Request {
      user?: AuthPayload;
      dbUser?: {
        id: number;
        role: string;
        isActive: boolean;
        permissions: Record<string, boolean> | null;
      };
    }
  }
}

export function requireAuth(req: Request, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    res.status(401).json({ error: "Unauthorized", message: "Authentication required" });
    return;
  }

  const token = authHeader.slice(7);
  try {
    const payload = jwt.verify(token, JWT_SECRET!) as AuthPayload;
    req.user = payload;
    next();
  } catch {
    res.status(401).json({ error: "Unauthorized", message: "Invalid or expired token" });
  }
}

async function loadAndValidateAdmin(req: Request, res: Response): Promise<boolean> {
  const [user] = await db
    .select({
      id: usersTable.id,
      role: usersTable.role,
      isActive: usersTable.isActive,
      permissions: usersTable.permissions,
    })
    .from(usersTable)
    .where(eq(usersTable.id, req.user!.userId))
    .limit(1);

  if (!user || !user.isActive) {
    res.status(403).json({ error: "Forbidden", message: "Account is deactivated" });
    return false;
  }

  if (user.role !== "admin" && user.role !== "superadmin") {
    res.status(403).json({ error: "Forbidden", message: "Admin access required" });
    return false;
  }

  req.dbUser = user;
  return true;
}

export function requireAdmin(req: Request, res: Response, next: NextFunction) {
  requireAuth(req, res, () => {
    loadAndValidateAdmin(req, res)
      .then((valid) => { if (valid) next(); })
      .catch(next);
  });
}

export function requireSuperAdmin(req: Request, res: Response, next: NextFunction) {
  requireAuth(req, res, () => {
    loadAndValidateAdmin(req, res)
      .then((valid) => {
        if (!valid) return;
        if (req.dbUser!.role !== "superadmin") {
          res.status(403).json({ error: "Forbidden", message: "Super-admin access required" });
          return;
        }
        next();
      })
      .catch(next);
  });
}

export function requireAdminPermission(permission: string) {
  return (req: Request, res: Response, next: NextFunction) => {
    requireAuth(req, res, () => {
      loadAndValidateAdmin(req, res)
        .then((valid) => {
          if (!valid) return;
          if (req.dbUser!.role === "superadmin") {
            next();
            return;
          }
          const perms = req.dbUser!.permissions;
          if (!perms || !perms[permission]) {
            res.status(403).json({ error: "Forbidden", message: `Permission '${permission}' required` });
            return;
          }
          next();
        })
        .catch(next);
    });
  };
}

export function requireUserAuth(req: Request, res: Response, next: NextFunction) {
  requireAuth(req, res, next);
}

export function signToken(payload: AuthPayload): string {
  return jwt.sign(payload, JWT_SECRET!, { expiresIn: "15m" });
}

export function signRefreshToken(userId: number): string {
  return jwt.sign({ userId }, JWT_REFRESH_SECRET!, { expiresIn: "30d" });
}

export function verifyRefreshToken(token: string): { userId: number } | null {
  try {
    return jwt.verify(token, JWT_REFRESH_SECRET!) as { userId: number };
  } catch {
    return null;
  }
}
