import { Navbar } from "@/components/navbar"
import { UserAuthForm } from "@/components/user-auth-form"

export default function UserLoginPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-green-100">
      <Navbar />
      <div className="flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <UserAuthForm mode="login" />
      </div>
    </div>
  )
}
