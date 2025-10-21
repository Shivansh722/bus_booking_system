import { Navbar } from "@/components/navbar"
import { AdminAuthForm } from "@/components/admin-auth-form"

export default function AdminSignupPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-100">
      <Navbar />
      <div className="flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <AdminAuthForm mode="signup" />
      </div>
    </div>
  )
}
