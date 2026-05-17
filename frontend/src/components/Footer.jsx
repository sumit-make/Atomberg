import { useContext } from "react"
import { useNavigate } from "react-router-dom"
import { AuthContext } from "../context/AuthContext"

const Footer = () => {
  return (
    <footer className="border-t border-slate-200 bg-white/90 py-10 text-slate-700 backdrop-blur-xl">
      <div className="mx-auto max-w-6xl px-4">
        <div className="grid gap-10 md:grid-cols-3">
          <div>
            <h3 className="font-semibold text-slate-900">AtomBergy Portal</h3>
            <p className="mt-2 text-sm text-slate-600">Goal-setting, progress tracking, and performance reporting in one place.</p>
          </div>
          <div>
            <h4 className="font-semibold text-slate-900">Quick Links</h4>
            <ul className="mt-3 space-y-2 text-sm text-slate-600">
              <li><a href="#" className="hover:text-slate-900">Documentation</a></li>
              <li><a href="#" className="hover:text-slate-900">Support</a></li>
              <li><a href="#" className="hover:text-slate-900">Privacy</a></li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold text-slate-900">Legal</h4>
            <ul className="mt-3 space-y-2 text-sm text-slate-600">
              <li><a href="#" className="hover:text-slate-900">Terms of Service</a></li>
              <li><a href="#" className="hover:text-slate-900">Privacy Policy</a></li>
              <li><a href="#" className="hover:text-slate-900">Contact Us</a></li>
            </ul>
          </div>
        </div>
        <div className="mt-10 border-t border-slate-200 pt-8 text-center text-sm text-slate-500">
          <p>&copy; 2026 AtomBerg. All rights reserved.</p>
        </div>
      </div>
    </footer>
  )
}

export default Footer
