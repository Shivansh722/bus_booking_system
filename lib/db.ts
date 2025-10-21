import mongoose from "mongoose"
import { User } from "@/models/user"
import { hashPassword } from "@/lib/auth"

const MONGODB_URI = process.env.MONGODB_URI || ""

if (!MONGODB_URI) {
  console.warn("[DB] MONGODB_URI is not set. Add it in Vars for the project.")
}

type GlobalWithMongoose = typeof globalThis & {
  _mongooseConn?: Promise<typeof mongoose>
}

declare const globalThisWithMongoose: GlobalWithMongoose

export async function dbConnect() {
  const g = globalThis as GlobalWithMongoose
  if (!g._mongooseConn) {
    g._mongooseConn = mongoose
      .connect(MONGODB_URI, { dbName: process.env.MONGODB_DB || "bus_app" })
      .then((m) => {
        // Optionally seed an admin from env if provided
        const email = process.env.ADMIN_EMAIL
        const password = process.env.ADMIN_PASSWORD
        if (email && password) {
          User.findOne({ email, role: "admin" })
            .then(async (found) => {
              if (!found) {
                const hashed = await hashPassword(password)
                await User.create({ email, password: hashed, role: "admin" })
                console.log(`[DB] Seeded admin ${email}`)
              }
            })
            .catch(() => {})
        }
        return m
      })
      .catch((err) => {
        console.error("[DB] connection error", err)
        throw err
      })
  }
  return g._mongooseConn
}
