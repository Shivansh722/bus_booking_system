import { UserNavbar } from "@/components/user-navbar"
import { UserAuthForm } from "@/components/user-auth-form"

export default function UserLoginPage() {
  return (
    <div className="min-h-screen bg-background">
      <UserNavbar />
      <div className="flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <UserAuthForm mode="login" />
      </div>
    </div>
  )
}
