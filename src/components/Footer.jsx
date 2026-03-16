import { Facebook, Instagram, Twitter, Mail } from "lucide-react"
import { motion } from "framer-motion"
import { Link } from "react-router-dom"

const fadeUp = {
  hidden: { opacity: 0, y: 60 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.7 }
  }
}

export default function Footer() {
  return (
    <motion.footer
      variants={fadeUp}
      initial="hidden"
      whileInView="show"
      viewport={{ once: true }}
      className="bg-zinc-900 text-gray-300 py-10 px-6"
    >
      <div className="max-w-7xl mx-auto py-14">

        {/* Top Section */}
        <div className="grid gap-10 md:grid-cols-2 lg:grid-cols-4">

          {/* Brand */}
          <div>
            <h2 className="text-2xl font-bold text-emerald-500">
              PrintFlow
            </h2>

            <p className="mt-4 text-sm text-zinc-400 leading-relaxed">
              High quality printing solutions for businesses and individuals.
              Upload designs, approve proofs, and receive professional prints
              delivered quickly.
            </p>

            {/* Social Icons */}
            <div className="flex gap-4 mt-6">

              <Facebook className="cursor-pointer hover:text-emerald-500 transition-colors"/>

              <Instagram className="cursor-pointer hover:text-emerald-500 transition-colors"/>

              <Twitter className="cursor-pointer hover:text-emerald-500 transition-colors"/>

              <Mail className="cursor-pointer hover:text-emerald-500 transition-colors"/>

            </div>
          </div>


          {/* Services */}
          <div>
            <h3 className="text-white font-semibold mb-4">
              Services
            </h3>

            <ul className="space-y-2 text-sm">
              <li className="hover:text-emerald-400 transition-colors cursor-pointer">
                Business Cards
              </li>

              <li className="hover:text-emerald-400 transition-colors cursor-pointer">
                Flyers & Posters
              </li>

              <li className="hover:text-emerald-400 transition-colors cursor-pointer">
                Banners
              </li>

              <li className="hover:text-emerald-400 transition-colors cursor-pointer">
                Custom Branding
              </li>
            </ul>
          </div>


          {/* Quick Links */}
          <div>
            <h3 className="text-white font-semibold mb-4">
              Quick Links
            </h3>

            <ul className="space-y-2 text-sm">

              <li>
                <Link
                  to="/"
                  className="hover:text-emerald-400 transition-colors"
                >
                  Home
                </Link>
              </li>

              <li>
                <Link
                  to="/about"
                  className="hover:text-emerald-400 transition-colors"
                >
                  About
                </Link>
              </li>

              <li>
                <Link
                  to="/pricing"
                  className="hover:text-emerald-400 transition-colors"
                >
                  Pricing
                </Link>
              </li>

              <li>
                <Link
                  to="/contact"
                  className="hover:text-emerald-400 transition-colors"
                >
                  Contact
                </Link>
              </li>

            </ul>
          </div>


          {/* Contact */}
          <div>
            <h3 className="text-white font-semibold mb-4">
              Contact
            </h3>

            <ul className="space-y-2 text-sm text-zinc-400">
              <li>Nairobi, Kenya</li>
              <li>+254 707 458198</li>
              <li>support@printflow.com</li>
              <li>Mon - Fri : 8am - 6pm</li>
            </ul>
          </div>

        </div>


        {/* Divider */}
        <div className="border-t border-zinc-700 mt-12 pt-6 flex flex-col md:flex-row justify-between items-center text-sm text-zinc-500">

          <p>
            © {new Date().getFullYear()} PrintFlow. All rights reserved.
          </p>

          <div className="flex gap-6 mt-4 md:mt-0">

            <Link
              to="/privacy"
              className="hover:text-emerald-400"
            >
              Privacy Policy
            </Link>

            <Link
              to="/terms"
              className="hover:text-emerald-400"
            >
              Terms
            </Link>

          </div>

        </div>

      </div>
    </motion.footer>
  )
}