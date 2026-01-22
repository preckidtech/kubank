import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ShieldCheck, ArrowRight, Building2 } from "lucide-react"

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-white p-6 text-center">
      <div className="max-w-3xl space-y-8 animate-in fade-in zoom-in duration-500">
        
        {/* Badge */}
        <div className="mx-auto w-fit rounded-full bg-blue-50 px-4 py-1.5 text-sm font-medium text-blue-600 ring-1 ring-inset ring-blue-600/20 flex items-center gap-2">
          <Building2 className="h-3 w-3" /> Secure Banking System
        </div>

        {/* Hero Text */}
        <h1 className="text-5xl font-extrabold tracking-tight text-slate-900 sm:text-7xl">
          KU <span className="text-blue-600">Bank</span>
        </h1>
        
        <p className="mx-auto max-w-xl text-lg text-slate-600 leading-relaxed">
          The future of digital finance. Experience seamless transfers, real-time insights, and iron-clad security.
        </p>

        {/* Action Buttons */}
        <div className="flex flex-col items-center justify-center gap-4 sm:flex-row pt-4">
          <Link href="/login">
            <Button size="lg" className="h-12 px-8 text-base bg-blue-600 hover:bg-blue-700 w-full sm:w-auto">
              Log In
            </Button>
          </Link>
          <Link href="/register">
            <Button size="lg" variant="outline" className="h-12 px-8 text-base border-slate-300 w-full sm:w-auto">
              Open Account <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </Link>
        </div>

        {/* Footer Features */}
        <div className="mt-12 flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-8 text-sm text-slate-400">
          <div className="flex items-center gap-2">
            <ShieldCheck className="h-4 w-4 text-green-500" /> Fully Encrypted
          </div>
          <div className="flex items-center gap-2">
            <ShieldCheck className="h-4 w-4 text-green-500" /> 24/7 Access
          </div>
        </div>

      </div>
    </main>
  )
}