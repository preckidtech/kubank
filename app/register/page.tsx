"use client"

import { useState } from "react"
import { registerUser } from "@/actions/register"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Loader2, Eye, EyeOff, ShieldCheck, CheckCircle2 } from "lucide-react"
import Link from "next/link"

export default function RegisterPage() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [showPass, setShowPass] = useState(false)
  const [pass, setPass] = useState("")
  const [confirmPass, setConfirmPass] = useState("")

  const requirements = [
    { label: "8+ chars", met: pass.length >= 8 },
    { label: "Up/Low", met: /[a-z]/.test(pass) && /[A-Z]/.test(pass) },
    { label: "Number", met: /\d/.test(pass) },
    { label: "Special", met: /[@$!%*?&]/.test(pass) },
  ]

  const isFormValid = requirements.every(r => r.met) && pass === confirmPass && pass !== ""

  async function handleRegister(formData: FormData) {
    setLoading(true)
    setError("")
    const result = await registerUser(formData)
    if (result?.error) {
      setError(result.error)
      setLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 p-2 sm:p-4">
      <Card className="w-full max-w-lg shadow-xl border-slate-200 overflow-hidden">
        <CardHeader className="bg-slate-900 text-white py-4 px-6 flex flex-row items-center justify-between space-y-0">
          <div>
            <CardTitle className="text-xl font-bold">Nexus Bank</CardTitle>
            <p className="text-xs text-slate-400">Secure Account Opening</p>
          </div>
          <ShieldCheck className="h-6 w-6 text-blue-400" />
        </CardHeader>

        <CardContent className="p-5 space-y-4">
          <form action={handleRegister} className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-3">
            
            {/* Names */}
            <div className="space-y-1">
              <Label className="text-xs" htmlFor="firstName">First Name</Label>
              <Input id="firstName" name="firstName" placeholder="John" required className="h-9 text-sm" />
            </div>
            <div className="space-y-1">
              <Label className="text-xs" htmlFor="lastName">Last Name</Label>
              <Input id="lastName" name="lastName" placeholder="Doe" required className="h-9 text-sm" />
            </div>

            {/* Email - Full Width on Grid */}
            <div className="sm:col-span-2 space-y-1">
              <Label className="text-xs" htmlFor="email">Email Address</Label>
              <Input id="email" name="email" type="email" required className="h-9 text-sm" />
            </div>

            {/* Passwords */}
            <div className="space-y-1">
              <Label className="text-xs" htmlFor="password">Password</Label>
              <div className="relative">
                <Input 
                  id="password" 
                  name="password" 
                  type={showPass ? "text" : "password"} 
                  value={pass}
                  onChange={(e) => setPass(e.target.value)}
                  required 
                  className="h-9 text-sm pr-8"
                />
                <button type="button" onClick={() => setShowPass(!showPass)} className="absolute right-2 top-2 text-slate-400">
                  {showPass ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>
            <div className="space-y-1">
              <Label className="text-xs" htmlFor="confirmPassword">Confirm</Label>
              <Input 
                id="confirmPassword" 
                type="password" 
                value={confirmPass}
                onChange={(e) => setConfirmPass(e.target.value)}
                required 
                className={`h-9 text-sm ${confirmPass && pass !== confirmPass ? "border-red-500" : ""}`} 
              />
            </div>

            {/* Password Micro-Checklist (Compact) */}
            <div className="sm:col-span-2 flex flex-wrap gap-x-4 gap-y-1 py-1 border-y border-slate-100">
              {requirements.map((req, i) => (
                <div key={i} className="flex items-center gap-1.5 text-[10px]">
                  <CheckCircle2 className={`h-3 w-3 ${req.met ? "text-green-500" : "text-slate-200"}`} />
                  <span className={req.met ? "text-slate-900" : "text-slate-400"}>{req.label}</span>
                </div>
              ))}
            </div>

            {/* PIN - Full Width */}
            <div className="sm:col-span-2 space-y-1">
              <div className="flex justify-between items-center">
                 <Label className="text-xs" htmlFor="pin">Transaction PIN (4 Digits)</Label>
                 <span className="text-[10px] text-slate-400">Required for transfers</span>
              </div>
              <Input id="pin" name="pin" type="password" maxLength={4} placeholder="****" className="h-9 text-center font-bold tracking-[0.5rem]" required />
            </div>

            {/* Errors and Submit */}
            <div className="sm:col-span-2 pt-2">
              {error && <p className="text-[11px] text-red-500 text-center mb-2">{error}</p>}
              <Button 
                type="submit" 
                className="w-full h-10 bg-blue-600 hover:bg-blue-700 text-white font-bold" 
                disabled={loading || !isFormValid}
              >
                {loading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : "Open Account"}
              </Button>
            </div>

          </form>

          <p className="text-center text-xs text-slate-500 pt-2 border-t border-slate-100">
            Have an account? <Link href="/login" className="text-blue-600 font-bold hover:underline">Sign In</Link>
          </p>
        </CardContent>
      </Card>
    </div>
  )
}