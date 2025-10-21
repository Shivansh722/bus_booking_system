import { cookies } from "next/headers"
import type { NextRequest } from "next/server"
import { SignJWT, jwtVerify } from "jose"
import bcrypt from "bcryptjs"

const TOKEN_NAME = "token"

function getJwtSecret() {
  const secret = process.env.JWT_SECRET
  if (!secret) {
    console.warn("[Auth] JWT_SECRET is not set. Add it in Vars for the project.")
  }
  return new TextEncoder().encode(secret || "dev-secret-do-not-use")
}

export type JwtPayload = {
  sub: string
  role: "user" | "admin"
  iat?: number
  exp?: number
  sessionId?: string
}

export async function hashPassword(password: string) {
  const salt = await bcrypt.genSalt(10)
  return bcrypt.hash(password, salt)
}

export async function comparePassword(password: string, hash: string) {
  return bcrypt.compare(password, hash)
}

export async function signJwt(payload: JwtPayload) {
  // Add session ID for better session management
  const enhancedPayload = {
    ...payload,
    sessionId: crypto.randomUUID(),
  }
  
  const token = await new SignJWT(enhancedPayload as any)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("2h") // Shorter session timeout for better security
    .sign(getJwtSecret())
  return token
}

export async function verifyJwtFromRequest(req: NextRequest): Promise<JwtPayload | null> {
  const cookie = req.cookies.get(TOKEN_NAME)?.value
  if (!cookie) return null
  try {
    const { payload } = await jwtVerify(cookie, getJwtSecret())
    const jwtPayload = payload as unknown as JwtPayload
    
    // Check if token is expired (additional check beyond JWT's built-in expiration)
    if (jwtPayload.exp && Date.now() >= jwtPayload.exp * 1000) {
      return null
    }
    
    return jwtPayload
  } catch {
    return null
  }
}

export function setAuthCookie(res: Response, token: string) {
  const isProduction = process.env.NODE_ENV === "production"
  const maxAge = 60 * 60 * 2 // 2 hours to match JWT expiration
  
  const cookie = `${TOKEN_NAME}=${token}; Path=/; HttpOnly; SameSite=Strict; Max-Age=${maxAge}; ${
    isProduction ? "Secure;" : ""
  }`
  res.headers.append("Set-Cookie", cookie)
}

export function clearAuthCookie(res: Response) {
  const isProduction = process.env.NODE_ENV === "production"
  const cookie = `${TOKEN_NAME}=; Path=/; HttpOnly; SameSite=Strict; Max-Age=0; ${
    isProduction ? "Secure;" : ""
  }`
  res.headers.append("Set-Cookie", cookie)
}

export function assertRole(payload: JwtPayload | null, role?: "admin" | "user") {
  if (!payload) return false
  if (!role) return true
  return payload.role === role
}
