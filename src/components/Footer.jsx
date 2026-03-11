import { Facebook, Instagram, Twitter, Mail } from "lucide-react"
import { motion } from "framer-motion"


const fadeUp = {
  hidden: { opacity: 0, y: 60 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.7 }
  }
};
export default function Footer() {
  return (
    <motion.footer variants={fadeUp} className="bg-zinc-900 text-gray-300 py-10 px-6">
      <div className="max-w-7xl mx-auto px-6 py-14">

        {/* Top Section */}
        <div className="grid gap-10 md:grid-cols-2 lg:grid-cols-4">

          {/* Brand */}
          <div>
            <h2 className="text-2xl font-bold text-rose-500">
              PrintFlow
            </h2>

            <p className="mt-4 text-sm text-zinc-400 leading-relaxed">
              High quality printing solutions for businesses and individuals.
              Upload designs, approve proofs, and receive professional prints
              delivered quickly.
            </p>

            {/* Social Icons */}
            <motion.div className="flex gap-4 mt-6">
              <Facebook className="cursor-pointer hover:text-rose-500 transition-colors"/>
              <Instagram className="cursor-pointer hover:text-rose-500 transition-colors"/>
              <Twitter className="cursor-pointer hover:text-rose-500 transition-colors"/>
              <Mail className="cursor-pointer hover:text-rose-500 transition-colors"/>
            </motion.div>
          </div>


          {/* Services */}
          <motion.div>
            <h3 className="text-white font-semibold mb-4">
              Services
            </h3>

            <ul className="space-y-2 text-sm">
              <li className="hover:text-rose-400 transition-colors cursor-pointer">
                Business Cards
              </li>
              <li className="hover:text-rose-400 transition-colors cursor-pointer">
                Flyers & Posters
              </li>
              <li className="hover:text-rose-400 transition-colors cursor-pointer">
                Banners
              </li>
              <li className="hover:text-rose-400 transition-colors cursor-pointer">
                Custom Branding
              </li>
            </ul>
          </motion.div>


          {/* Quick Links */}
          <motion.div>
            <h3 className="text-white font-semibold mb-4">
              Quick Links
            </h3>

            <ul className="space-y-2 text-sm">
              <li className="hover:text-rose-400 transition-colors cursor-pointer">
                Home
              </li>
              <li className="hover:text-rose-400 transition-colors cursor-pointer">
                About
              </li>
              <li className="hover:text-rose-400 transition-colors cursor-pointer">
                Pricing
              </li>
              <li className="hover:text-rose-400 transition-colors cursor-pointer">
                Contact
              </li>
            </ul>
          </motion.div>


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
            <span className="hover:text-rose-400 cursor-pointer">
              Privacy Policy
            </span>
            <span className="hover:text-rose-400 cursor-pointer">
              Terms
            </span>
          </div>

        </div>

      </div>
    </motion.footer>
  )
}