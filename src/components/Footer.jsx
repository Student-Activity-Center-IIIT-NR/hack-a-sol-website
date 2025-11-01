
import { Github, Twitter, Linkedin, Mail, MapPin, Phone } from "lucide-react";

const Footer = () => {

  return (
    console.log("Rendering Footer"),
    <footer className="relative border-t border-border bg-card/30 backdrop-blur">
      <div className="container px-4 py-12">
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 mb-8">
          {/* About */}
          <div>
            <h3 className="text-xl font-bold mb-4 text-primary">Hack-A-Sol</h3>
            <p className="text-muted-foreground text-sm mb-4">
              Rev up your coding skills in the ultimate college hackathon. Speed, innovation, and competition combined.
            </p>
            <div className="flex gap-3">
              <a href="#" className="text-muted-foreground hover:text-primary transition-colors">
                <Github className="w-5 h-5" />
              </a>
              <a href="#" className="text-muted-foreground hover:text-primary transition-colors">
                <Twitter className="w-5 h-5" />
              </a>
              <a href="#" className="text-muted-foreground hover:text-primary transition-colors">
                <Linkedin className="w-5 h-5" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-lg font-bold mb-4">Quick Links</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <a href="#about" className="text-muted-foreground hover:text-primary transition-colors">
                  About
                </a>
              </li>
              <li>
                <a href="#schedule" className="text-muted-foreground hover:text-primary transition-colors">
                  Schedule
                </a>
              </li>
              <li>
                <a href="#prizes" className="text-muted-foreground hover:text-primary transition-colors">
                  Prizes
                </a>
              </li>
              <li>
                <a href="#faq" className="text-muted-foreground hover:text-primary transition-colors">
                  FAQ
                </a>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="text-lg font-bold mb-4">Contact Us</h3>
            <ul className="space-y-3 text-sm">
              <li className="flex items-start gap-2 text-muted-foreground">
                <Mail className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                <span>hackasol@iiitnr.ac.in</span>
              </li>
              <li className="flex items-start gap-2 text-muted-foreground">
                <Phone className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                <span>8109082272,6264883082</span>
              </li>
              <li className="flex items-start gap-2 text-muted-foreground">
                <MapPin className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                <span>College Campus<br />Main Auditorium</span>
              </li>
            </ul>
          </div>

          {/* Newsletter */}
        </div>

        <div className="border-t border-border pt-8 text-center text-sm text-muted-foreground">
          <p>© 2025 Hack-A-Sol. All rights reserved. Built with passion and code.</p>
        </div>
      </div>
      
    </footer>
  );
};

export default Footer;
