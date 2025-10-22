"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { User, AlertTriangle, CheckCircle, XCircle, Info } from "lucide-react"

interface ValidationState {
  email: {
    isValid: boolean
    message: string
  }
  password: {
    isValid: boolean
    message: string
  }
}

export function UserAuthForm({ mode }: { mode: "login" | "signup" }) {
  const router = useRouter()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [validation, setValidation] = useState<ValidationState>({
    email: { isValid: false, message: "" },
    password: { isValid: false, message: "" }
  })

  // User-specific validation rules
  const validateUserEmail = (email: string) => {
    if (!email) {
      return { isValid: false, message: "Email address is required" }
    }
    
    // Reject admin emails in user form
    if (email.toLowerCase().startsWith('admin@')) {
      return { 
        isValid: false, 
        message: "Admin emails cannot be used for user accounts. Please use the admin login." 
      }
    }
    
    // Standard email validation
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailPattern.test(email)) {
      return { 
        isValid: false, 
        message: "Please enter a valid email address" 
      }
    }
    
    return { isValid: true, message: "Valid email format" }
  }

  const validateUserPassword = (password: string) => {
    if (!password) {
      return { isValid: false, message: "Password is required" }
    }
    
    if (mode === "login") {
      // For login, just check if password is provided
      return { isValid: true, message: "Password provided" }
    }
    
    // For signup, enforce password requirements
    if (password.length < 6) {
      return { 
        isValid: false, 
        message: "Password must be at least 6 characters long" 
      }
    }
    
    const hasLetter = /[a-zA-Z]/.test(password)
    const hasNumber = /\d/.test(password)
    
    if (!hasLetter || !hasNumber) {
      return { 
        isValid: false, 
        message: "Password must contain both letters and numbers" 
      }
    }
    
    return { isValid: true, message: "Strong password" }
  }

  // Real-time validation
  useEffect(() => {
    setValidation({
      email: validateUserEmail(email),
      password: validateUserPassword(password)
    })
  }, [email, password, mode])

  const isFormValid = validation.email.isValid && validation.password.isValid

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    
    if (!isFormValid) {
      setError("Please fix validation errors before submitting")
      return
    }
    
    setLoading(true)
    setError(null)
    
    try {
      const res = await fetch(`/api/auth/user/${mode}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      })
      
      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        
        // Specific error messages for user authentication
        if (res.status === 401) {
          setError("Invalid email or password. Please check your credentials and try again.")
        } else if (res.status === 403) {
          setError("This is a user-only area. Admin accounts cannot access user services.")
        } else if (res.status === 409) {
          setError("An account with this email already exists. Please try logging in instead.")
        } else {
          setError(data.error || "Authentication failed. Please try again.")
        }
        return
      }
      
      // Success - redirect to user dashboard
      router.push("/tickets")
      router.refresh()
      
    } catch (err) {
      setError("Network error. Please check your connection and try again.")
    } finally {
      setLoading(false)
    }
  }

  const ValidationIcon = ({ isValid }: { isValid: boolean }) => {
    if (isValid) {
      return <CheckCircle className="h-4 w-4 text-green-500" />
    }
    return <XCircle className="h-4 w-4 text-red-500" />
  }

  return (
    <Card className="max-w-md w-full border-2 border-green-200 shadow-lg">
      <CardHeader className="bg-gradient-to-r from-green-600 to-green-700 text-white rounded-t-lg">
        <CardTitle className="text-center flex items-center justify-center gap-2">
          <User className="h-5 w-5" />
          {mode === "login" ? "User Login" : "Create Account"}
        </CardTitle>
      </CardHeader>
      
      <CardContent className="p-6">
        <Alert className="mb-4 border-green-200 bg-green-50">
          <Info className="h-4 w-4 text-green-600" />
          <AlertDescription className="text-green-800">
            <strong>User Access:</strong> {mode === "login" 
              ? "Sign in to book tickets and manage your reservations." 
              : "Create your account to start booking bus tickets."}
          </AlertDescription>
        </Alert>

        <form onSubmit={onSubmit} className="grid gap-4">
          <div className="grid gap-2">
            <Label htmlFor="user-email" className="flex items-center gap-2">
              Email Address
              <ValidationIcon isValid={validation.email.isValid} />
            </Label>
            <Input
              id="user-email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="your.email@example.com"
              className={`${
                email && !validation.email.isValid 
                  ? "border-red-500 focus:border-red-500" 
                  : email && validation.email.isValid 
                  ? "border-green-500 focus:border-green-500" 
                  : ""
              }`}
              required
            />
            {email && (
              <p className={`text-xs ${validation.email.isValid ? "text-green-600" : "text-red-600"}`}>
                {validation.email.message}
              </p>
            )}
          </div>

          <div className="grid gap-2">
            <Label htmlFor="user-password" className="flex items-center gap-2">
              Password
              <ValidationIcon isValid={validation.password.isValid} />
            </Label>
            <Input
              id="user-password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder={mode === "login" ? "Enter your password" : "Create a secure password"}
              className={`${
                password && !validation.password.isValid 
                  ? "border-red-500 focus:border-red-500" 
                  : password && validation.password.isValid 
                  ? "border-green-500 focus:border-green-500" 
                  : ""
              }`}
              required
            />
            {password && (
              <p className={`text-xs ${validation.password.isValid ? "text-green-600" : "text-red-600"}`}>
                {validation.password.message}
              </p>
            )}
          </div>

          {error && (
            <Alert className="border-red-200 bg-red-50">
              <XCircle className="h-4 w-4 text-red-600" />
              <AlertDescription className="text-red-800">
                {error}
              </AlertDescription>
            </Alert>
          )}

          <Button 
            type="submit" 
            disabled={loading || !isFormValid} 
            className="bg-green-600 hover:bg-green-700 text-white font-medium"
          >
            {loading ? (
              <span className="flex items-center gap-2">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                {mode === "login" ? "Signing in..." : "Creating account..."}
              </span>
            ) : (
              `${mode === "login" ? "Sign In" : "Create Account"}`
            )}
          </Button>
        </form>
      </CardContent>
      
      <CardFooter className="text-xs text-gray-600 bg-gray-50 rounded-b-lg">
        <div className="w-full">
          <div className="text-center mb-3">
            {mode === "login" ? (
              <p>
                Don't have an account?{" "}
                <Button
                  variant="link"
                  className="p-0 h-auto text-green-600 hover:text-green-800"
                  onClick={() => router.push("/user/signup")}
                >
                  Sign Up Here
                </Button>
              </p>
            ) : (
              <p>
                Already have an account?{" "}
                <Button
                  variant="link"
                  className="p-0 h-auto text-green-600 hover:text-green-800"
                  onClick={() => router.push("/user/login")}
                >
                  Login Here
                </Button>
              </p>
            )}
          </div>
          <p className="font-medium mb-1">
            {mode === "login" ? "Login Requirements:" : "Account Requirements:"}
          </p>
          <ul className="list-disc list-inside space-y-1">
            <li>Valid email address (not admin email)</li>
            {mode === "signup" && (
              <>
                <li>Password: 6+ characters with letters and numbers</li>
                <li>One account per email address</li>
              </>
            )}
            {mode === "login" && <li>Use your registered email and password</li>}
          </ul>
        </div>
      </CardFooter>
    </Card>
  )
}