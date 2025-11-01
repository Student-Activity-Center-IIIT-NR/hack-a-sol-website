import { Github, Twitter, Linkedin, Mail, Phone, MapPin } from "lucide-react"

export default function Footer() {
  return (
    <footer className="bg-black text-white">
      <div className="max-w-7xl mx-auto px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 text-center">
          {/* Left Column - Branding */}
          <div className="space-y-4">
            <h3 className="text-3xl font-bold text-red-500">Hack-A-Sol</h3>
            <p className="text-neutral-400 leading-relaxed">
              Rev up your coding skills in the ultimate college hackathon. Speed, innovation, and competition combined.
            </p>
            {/* Social Icons */}
            <div className="flex justify-center gap-4 pt-2">
              <a
                href="#"
                className="text-neutral-400 hover:text-red-500 transition-colors"
                aria-label="GitHub"
              >
                <Github size={24} />
              </a>
              <a
                href="#"
                className="text-neutral-400 hover:text-red-500 transition-colors"
                aria-label="Twitter"
              >
                <Twitter size={24} />
              </a>
              <a
                href="#"
                className="text-neutral-400 hover:text-red-500 transition-colors"
                aria-label="LinkedIn"
              >
                <Linkedin size={24} />
              </a>
            </div>
          </div>

          {/* Middle Column - Quick Links */}
          <div className="space-y-4">
            <h3 className="text-xl font-semibold text-white">Quick Links</h3>
            <ul className="space-y-3">
              <li>
                <a
                  href="#about"
                  className="text-neutral-400 hover:text-red-500 transition-colors"
                >
                  About
                </a>
              </li>
              <li>
                <a
                  href="#schedule"
                  className="text-neutral-400 hover:text-red-500 transition-colors"
                >
                  Schedule
                </a>
              </li>
              <li>
                <a
                  href="#themes"
                  className="text-neutral-400 hover:text-red-500 transition-colors"
                >
                  Themes
                </a>
              </li>
              <li>
                <a
                  href="#sponsors"
                  className="text-neutral-400 hover:text-red-500 transition-colors"
                >
                  Sponsors
                </a>
              </li>
            </ul>
          </div>

          {/* Right Column - Contact */}
          <div className="space-y-4">
            <h3 className="text-xl font-semibold text-white">Contact Us</h3>
            <div className="space-y-4">
              <div className="flex items-start gap-3 justify-center">
                <Mail className="text-red-500 flex-shrink-0 mt-1" size={20} />
                <a
                  href="mailto:hackasol@iiitnr.ac.in"
                  className="text-neutral-400 hover:text-red-500 transition-colors"
                >
                  hackasol@iiitnr.ac.in
                </a>
              </div>
              <div className="flex items-start gap-3 justify-center">
                <Phone className="text-red-500 flex-shrink-0 mt-1" size={20} />
                <div className="space-y-2">
                  <a
                    href="tel:8109082272"
                    className="block text-neutral-400 hover:text-red-500 transition-colors"
                  >
                    +91 8109082272
                  </a>
                  <a
                    href="tel:6264883082"
                    className="block text-neutral-400 hover:text-red-500 transition-colors"
                  >
                    +91 6264883082
                  </a>
                </div>
              </div>
              <div className="flex items-start gap-3 justify-center">
                <MapPin className="text-red-500 flex-shrink-0 mt-1" size={20} />
                <div className="text-neutral-400">
                  <p>College Campus</p>
                  <p>Main Auditorium</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Section - Copyright */}
        <div className="border-t border-neutral-800 mt-12 pt-8 flex justify-center items-center">
          <div className="flex flex-col items-center gap-4 text-sm text-neutral-500 text-center">
            <div className="flex items-center gap-2">
              <span>Made with</span>
              <span className="text-red-500">❤️</span>
              <span>from Web-Dev Team & Manas</span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}