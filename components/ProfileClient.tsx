"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Camera, User, Shield, Mail, CreditCard, Check, Copy } from "lucide-react"
import { updateProfileImage } from "@/actions/profile"

interface ProfileClientProps {
  user: {
    firstName: string;
    lastName: string;
    email: string;
    avatarUrl: string | null;
    accountNumber: string;
  }
}

export default function ProfileClient({ user }: ProfileClientProps) {
  const [uploading, setUploading] = useState(false)
  const [preview, setPreview] = useState<string | null>(user.avatarUrl)
  const [copied, setCopied] = useState(false)

  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setPreview(URL.createObjectURL(file))
    setUploading(true)
    
    const formData = new FormData()
    formData.append("image", file)
    await updateProfileImage(formData)
    setUploading(false)
  }

  const copyToClipboard = () => {
    navigator.clipboard.writeText(user.accountNumber)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="grid gap-6 md:grid-cols-3">
      {/* AVATAR SECTION */}
      <Card className="md:col-span-1 border-slate-200 shadow-sm rounded-[2rem] overflow-hidden bg-white">
        <CardContent className="pt-10 flex flex-col items-center">
          <div className="relative group">
            <div className="h-32 w-32 rounded-full border-4 border-white shadow-2xl bg-slate-50 overflow-hidden flex items-center justify-center">
              {preview ? (
                <img src={preview} alt="Avatar" className="h-full w-full object-cover" />
              ) : (
                <User className="h-16 w-16 text-slate-300" />
              )}
            </div>
            
            <label htmlFor="gallery-upload" className="absolute bottom-1 right-1 bg-blue-600 p-2.5 rounded-full text-white shadow-lg hover:bg-blue-700 cursor-pointer transition-all active:scale-90 border-2 border-white">
              <Camera className="h-4 w-4" />
            </label>
            <input id="gallery-upload" type="file" accept="image/*" className="hidden" onChange={handleImageChange} />
          </div>
          
          <div className="mt-6 text-center">
            {uploading ? (
              <p className="text-[10px] text-blue-600 font-bold animate-pulse uppercase">Updating...</p>
            ) : (
              <>
                <h3 className="text-xl font-bold text-slate-900">{user.firstName} {user.lastName}</h3>
                <p className="text-xs text-slate-400 font-medium">Nexus Premium User</p>
              </>
            )}
          </div>
        </CardContent>
      </Card>

      {/* INFO SECTION */}
      <Card className="md:col-span-2 border-slate-200 shadow-sm rounded-[2rem] bg-white">
        <CardHeader>
          <CardTitle className="text-xs font-bold uppercase tracking-widest text-slate-400">Account Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
           <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div className="space-y-1">
                <Label className="text-[10px] text-slate-400 font-bold uppercase">Email Address</Label>
                <p className="text-sm font-semibold flex items-center gap-2 text-slate-700">
                  <Mail size={14} className="text-blue-500" /> {user.email}
                </p>
              </div>
              <div className="space-y-1">
                <Label className="text-[10px] text-slate-400 font-bold uppercase">Account Status</Label>
                <p className="text-sm font-semibold flex items-center gap-2 text-green-600">
                  <Shield size={14} /> Fully Verified (Tier 1)
                </p>
              </div>
              <div className="sm:col-span-2 space-y-2">
                <Label className="text-[10px] text-slate-400 font-bold uppercase">Your Account Number</Label>
                <div 
                  onClick={copyToClipboard}
                  className="flex items-center justify-between p-3 bg-slate-50 border border-slate-100 rounded-xl cursor-pointer hover:bg-slate-100 transition-colors group"
                >
                  <div className="flex items-center gap-3">
                    <CreditCard size={16} className="text-slate-400" />
                    <span className="font-mono font-bold text-slate-900 tracking-wider">{user.accountNumber}</span>
                  </div>
                  {copied ? <Check size={16} className="text-green-600" /> : <Copy size={16} className="text-slate-300 group-hover:text-blue-600" />}
                </div>
              </div>
           </div>
           <Button variant="outline" className="w-full h-12 border-slate-200 rounded-2xl text-xs font-bold text-slate-600 hover:bg-slate-50">
             Security Settings
           </Button>
        </CardContent>
      </Card>
    </div>
  )
}