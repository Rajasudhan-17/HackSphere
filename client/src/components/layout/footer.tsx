import { Link } from "wouter";
import { Code } from "lucide-react";

export default function Footer() {
  const footerSections = [
    {
      title: "Platform",
      links: [
        { href: "/events", label: "Browse Events" },
        { href: "/organizer", label: "Host Event" },
        { href: "/leaderboard", label: "Leaderboard" },
        { href: "/resources", label: "Resources" },
      ],
    },
    {
      title: "Support",
      links: [
        { href: "/help", label: "Help Center" },
        { href: "/community", label: "Community" },
        { href: "/contact", label: "Contact Us" },
        { href: "/api-docs", label: "API Docs" },
      ],
    },
    {
      title: "Legal",
      links: [
        { href: "/privacy", label: "Privacy Policy" },
        { href: "/terms", label: "Terms of Service" },
        { href: "/cookies", label: "Cookie Policy" },
        { href: "/guidelines", label: "Community Guidelines" },
      ],
    },
  ];

  const socialLinks = [
    { href: "https://twitter.com/hacksphere", label: "Twitter", icon: "fab fa-twitter" },
    { href: "https://linkedin.com/company/hacksphere", label: "LinkedIn", icon: "fab fa-linkedin" },
    { href: "https://github.com/hacksphere", label: "GitHub", icon: "fab fa-github" },
    { href: "https://discord.gg/hacksphere", label: "Discord", icon: "fab fa-discord" },
  ];

  return (
    <footer className="bg-hack-dark text-white py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand Section */}
          <div className="col-span-1 md:col-span-2">
            <div className="flex items-center space-x-2 mb-6">
              <div className="w-8 h-8 bg-gradient-to-r from-hack-purple to-hack-indigo rounded-lg flex items-center justify-center">
                <Code className="text-white w-4 h-4" />
              </div>
              <span className="text-xl font-bold">HackSphere</span>
            </div>
            <p className="text-gray-300 mb-6 max-w-md">
              The premier platform for hackathons and coding competitions. 
              Connecting innovators worldwide to build the future together.
            </p>
            
            {/* Social Links */}
            <div className="flex space-x-4">
              {socialLinks.map((social) => (
                <a
                  key={social.label}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-gray-400 hover:text-white transition-colors p-2 rounded-lg hover:bg-white hover:bg-opacity-10"
                  aria-label={social.label}
                  data-testid={`social-${social.label.toLowerCase()}`}
                >
                  <i className={`${social.icon} text-xl`}></i>
                </a>
              ))}
            </div>
          </div>

          {/* Footer Links */}
          {footerSections.map((section) => (
            <div key={section.title}>
              <h3 className="font-semibold mb-4 text-white">{section.title}</h3>
              <ul className="space-y-2">
                {section.links.map((link) => (
                  <li key={link.href}>
                    <Link href={link.href}>
                      <a 
                        className="text-gray-300 hover:text-white transition-colors text-sm"
                        data-testid={`footer-${link.label.toLowerCase().replace(/\s+/g, '-')}`}
                      >
                        {link.label}
                      </a>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom Section */}
        <div className="border-t border-gray-700 mt-12 pt-8 flex flex-col md:flex-row justify-between items-center">
          <p className="text-gray-400 text-sm">
            © 2024 HackSphere. All rights reserved.
          </p>
          
          <div className="flex space-x-6 mt-4 md:mt-0">
            <Link href="/privacy">
              <a className="text-gray-400 hover:text-white transition-colors text-sm" data-testid="footer-privacy-bottom">
                Privacy Policy
              </a>
            </Link>
            <Link href="/terms">
              <a className="text-gray-400 hover:text-white transition-colors text-sm" data-testid="footer-terms-bottom">
                Terms of Service
              </a>
            </Link>
            <Link href="/cookies">
              <a className="text-gray-400 hover:text-white transition-colors text-sm" data-testid="footer-cookies-bottom">
                Cookie Policy
              </a>
            </Link>
          </div>
        </div>

        {/* Additional Info */}
        <div className="mt-8 pt-6 border-t border-gray-700 text-center">
          <p className="text-gray-400 text-sm">
            Built with ❤️ for the global developer community. 
            Join thousands of innovators shaping the future through code.
          </p>
        </div>
      </div>
    </footer>
  );
}
