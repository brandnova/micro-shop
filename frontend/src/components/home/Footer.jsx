import { Package, Mail, Phone } from 'lucide-react'

export default function Footer({ siteTitle, storeTag, contactEmail, contactNumber }) {
  return (
    <footer className="bg-zinc-900 text-zinc-500">
      {/* Accent top bar */}
      <div className="h-0.5 accent-bg" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12">
        <div className="grid sm:grid-cols-3 gap-10 mb-10">
          <div>
            <div className="flex items-center gap-2 mb-3">
              <div className="h-7 w-7 rounded-md accent-bg flex items-center justify-center">
                <Package size={13} className="text-white" />
              </div>
              <span className="font-serif text-white text-base">{siteTitle}</span>
            </div>
            <p className="text-sm leading-relaxed max-w-xs">{storeTag}</p>
          </div>

          <div>
            <h4 className="text-[10px] font-semibold text-zinc-400 uppercase tracking-widest mb-3">Quick Links</h4>
            <ul className="space-y-2 text-sm">
              {['Products', 'How it Works', 'Track Order', 'Upload Payment'].map(l => (
                <li key={l}><a href="#" className="hover:text-white transition-colors">{l}</a></li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="text-[10px] font-semibold text-zinc-400 uppercase tracking-widest mb-3">Contact</h4>
            <ul className="space-y-2 text-sm">
              {contactEmail && (
                <li className="flex items-center gap-2">
                  <Mail size={13} className="shrink-0" />
                  <a href={`mailto:${contactEmail}`} className="hover:text-white transition-colors truncate">{contactEmail}</a>
                </li>
              )}
              {contactNumber && (
                <li className="flex items-center gap-2">
                  <Phone size={13} className="shrink-0" />
                  <span>{contactNumber}</span>
                </li>
              )}
            </ul>
          </div>
        </div>

        <div className="border-t border-zinc-800 pt-6 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs">
          <p>© {new Date().getFullYear()} {siteTitle}. All rights reserved.</p>
          <p className="accent-text font-medium">MicroShop v2 | By Brand Nova</p>
        </div>
      </div>
    </footer>
  )
}