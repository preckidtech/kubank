"use client"

import { useState, FormEvent } from "react"
import { login } from "@/actions/login"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card"
import { Loader2, Eye, EyeOff, Fingerprint, AlertCircle } from "lucide-react"
import { useRouter } from "next/navigation"
import Link from "next/link"

export default function LoginPage() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [errorField, setErrorField] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  
  const [emailValue, setEmailValue] = useState("")
  const [passwordValue, setPasswordValue] = useState("")
  
  const router = useRouter()

  // This function handles the Enter key automatically via form submission
  async function handleOnSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault() // Prevents page reload
    setLoading(true)
    setError("")
    setErrorField("")

    const formData = new FormData()
    formData.append("email", emailValue)
    formData.append("password", passwordValue)
    
    const result = await login(formData)
    
    if (result?.error) {
      setError(result.error)
      setErrorField(result.field || "")
      
      // Clear password if it's wrong, keep email
      if (result.field === "password" || result.field === "email") {
        setPasswordValue("")
      }
      
      setLoading(false)
    } else {
        router.push("/dashboard")
        router.refresh()
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 p-4">
      <Card className="w-full max-w-md shadow-lg border-slate-200 bg-white">
        <CardHeader className="space-y-1 text-center">
          <div className="flex justify-center mb-2">
            <div className="bg-blue-600 p-3 rounded-full text-white shadow-md">
              <Fingerprint className="h-6 w-6" />
            </div>
          </div>
          <CardTitle className="text-2xl font-bold text-slate-900">Welcome Back</CardTitle>
          <CardDescription>Securely login to your Nexus account</CardDescription>
        </CardHeader>
        <CardContent>
          {/* Form wrapper enables the 'Enter' key to trigger submission */}
          <form onSubmit={handleOnSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email Address</Label>
              <Input 
                id="email" 
                type="email" 
                placeholder="you@example.com" 
                value={emailValue}
                onChange={(e) => setEmailValue(e.target.value)}
                required
                className={`bg-slate-50 ${errorField === "email" ? "border-red-500 ring-red-100" : ""}`}
              />
            </div>
            
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="password">Password</Label>
                <Link href="#" className="text-xs text-blue-600 hover:underline font-medium">
                  Forgot password?
                </Link>
              </div>
              <div className="relative">
                <Input 
                  id="password" 
                  type={showPassword ? "text" : "password"} 
                  value={passwordValue}
                  onChange={(e) => setPasswordValue(e.target.value)}
                  required
                  className={`bg-slate-50 pr-10 ${errorField === "password" ? "border-red-500 ring-red-100" : ""}`}
                />
                <button 
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-700"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>
            
            {error && (
              <div className="p-3 rounded-md bg-red-50 text-red-700 text-sm font-medium border border-red-200 flex items-center gap-2 animate-in fade-in slide-in-from-top-1">
                <AlertCircle className="h-4 w-4 text-red-600 flex-shrink-0" />
                {error}
              </div>
            )}

            <Button 
              type="submit" // Trigger form onSubmit
              className="w-full bg-blue-600 hover:bg-blue-700 text-white h-11" 
              disabled={loading}
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Verifying...
                </>
              ) : "Sign In"}
            </Button>
          </form>

          <div className="mt-6 relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t border-slate-200" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-white px-2 text-slate-400 font-medium">Or security check</span>
            </div>
          </div>

          <Button variant="outline" className="w-full mt-4 h-11 border-slate-200 text-slate-600" disabled>
            <Fingerprint className="mr-2 h-4 w-4 text-blue-600" /> Sign in with Biometrics
          </Button>
        </CardContent>
        <CardFooter className="flex flex-col gap-2 border-t border-slate-100 mt-4 pt-6 bg-slate-50/50 rounded-b-lg">
          <div className="text-sm text-center text-slate-600">
            Don&apos;t have an account?{" "}
            <Link href="/register" className="text-blue-600 font-bold hover:underline">
              Create Account
            </Link>
          </div>
        </CardFooter>
      </Card>
    </div>
  )
}