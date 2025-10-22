import { AdminNavbar } from "@/components/admin-navbar"
import { AdminAuthForm } from "@/components/admin-auth-form"

export default function AdminSignupPage() {
  return (
    <div className="min-h-screen bg-background">
      <AdminNavbar />
      <div className="flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <AdminAuthForm mode="signup" />
      </div>
    </div>
  )
}
