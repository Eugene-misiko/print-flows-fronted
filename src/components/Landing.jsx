import React from "react";
import homeImg from "../assets/homeImg.avif";
import { Link } from "react-router-dom";

const Landing = () => {
  return (
    <div className="w-full overflow-x-hidden">

      
      <section
        className="relative h-screen  flex items-center justify-center text-center"
        style={{
          backgroundImage: `url(${homeImg})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      >
        <div className="absolute inset-0 bg-black/60"></div>
        <div className="relative z-10 px-6 max-w-3xl text-white">
          <h1 className="text-4xl md:text-5xl font-bold mb-6">
            Smart Printing Management System
          </h1>

          <p className="text-lg text-gray-200 mb-8">
            Manage your printing orders easily in one platform. Upload designs,
            collaborate with designers, approve changes, and track your order
            from design to final printing.
          </p>

          <Link
            to="/login"
            className="bg-rose-600 hover:bg-rose-700 px-8 py-3 rounded-lg text-lg font-semibold transition"
          >
            Get Started
          </Link>
        </div>
      </section>
      <section className="py-20 px-10 bg-rose-50">
        <h2 className="text-3xl font-bold text-center text-rose-700 mb-14">
          Key Features
        </h2>

        <div className="grid md:grid-cols-3 gap-10 max-w-6xl mx-auto">
          <div className="bg-white p-8 rounded-xl shadow hover:shadow-lg transition">
            <h3 className="text-xl font-semibold text-rose-600 mb-3">
              Easy Order Management
            </h3>
            <p className="text-gray-600">
              Submit and manage printing orders quickly with a simple and
              organized system.
            </p>
          </div>

          <div className="bg-white p-8 rounded-xl shadow hover:shadow-lg transition">
            <h3 className="text-xl font-semibold text-rose-600 mb-3">
              Design Collaboration
            </h3>
            <p className="text-gray-600">
              Work with designers to review, update, and finalize your design
              before printing.
            </p>
          </div>

          <div className="bg-white p-8 rounded-xl shadow hover:shadow-lg transition">
            <h3 className="text-xl font-semibold text-rose-600 mb-3">
              Order Tracking
            </h3>
            <p className="text-gray-600">
              Track your order progress from design stage to final printing and
              completion.
            </p>
          </div>
        </div>
      </section>
      <section className="bg-white py-20 px-10">
        <h2 className="text-3xl font-bold text-center text-rose-700 mb-14">
          How It Works
        </h2>

        <div className="grid md:grid-cols-4 gap-10 text-center max-w-6xl mx-auto">
          <div>
            <div className="text-3xl font-bold text-rose-600 mb-2">1</div>
            <p>Create an order and upload your design.</p>
          </div>

          <div>
            <div className="text-3xl font-bold text-rose-600 mb-2">2</div>
            <p>Designers review and prepare the design.</p>
          </div>

          <div>
            <div className="text-3xl font-bold text-rose-600 mb-2">3</div>
            <p>Approve the final design before printing.</p>
          </div>

          <div>
            <div className="text-3xl font-bold text-rose-600 mb-2">4</div>
            <p>The order proceeds to printing and completion.</p>
          </div>
        </div>
      </section>
      <section className="bg-rose-100 text-center py-20 px-6">
        <h2 className="text-3xl font-bold text-rose-700 mb-6">
          Ready to Start Your Printing Order?
        </h2>

        <p className="text-gray-700 mb-8">
          Login to your account and start managing your printing orders today.
        </p>

        <Link
          to="/login"
          className="bg-rose-600 text-white px-10 py-3 rounded-lg text-lg hover:bg-rose-700 transition"
        >
          Login Now
        </Link>
      </section>
    </div>
  );
};

export default Landing;