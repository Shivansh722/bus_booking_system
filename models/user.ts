import { Schema, model, models } from "mongoose"

export type UserRole = "user" | "admin"

export interface IUser {
  _id: string
  email: string
  password: string
  role: UserRole
  createdAt: Date
  updatedAt: Date
}

const UserSchema = new Schema<IUser>(
  {
    email: { type: String, unique: true, required: true, index: true },
    password: { type: String, required: true },
    role: { type: String, enum: ["user", "admin"], required: true },
  },
  { timestamps: true },
)

export const User = models.User || model<IUser>("User", UserSchema)
