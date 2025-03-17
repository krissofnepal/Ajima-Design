"use client";

import { useState } from "react";
import Link from "next/link";

export default function Home() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <div className="min-h-screen bg-white">
      {/* Navigation */}
      <nav className="fixed top-0 w-full bg-white/95 backdrop-blur-sm shadow-md z-50 transition-all duration-300">
        <div className="max-w-content mx-auto px-4 sm:px-6">
          <div className="flex justify-between h-16">
            <div className="flex-shrink-0 flex items-center">
              <span className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-blue-800 bg-clip-text text-transparent">
                Ajima Design & Construction
              </span>
            </div>
            <div className="hidden md:flex items-center space-x-8">
              <a
                href="#"
                className="text-gray-600 hover:text-blue-600 transition-colors duration-300"
              >
                Home
              </a>
              <a
                href="#services"
                className="text-gray-600 hover:text-blue-600 transition-colors duration-300"
              >
                Services
              </a>
              <a
                href="#about"
                className="text-gray-600 hover:text-blue-600 transition-colors duration-300"
              >
                About
              </a>
              <a
                href="#contact"
                className="text-gray-600 hover:text-blue-600 transition-colors duration-300"
              >
                Contact
              </a>
              <Link
                href="/login"
                className="bg-transparent border-2 border-blue-600 text-blue-600 px-6 py-2 rounded-lg hover:bg-blue-600 hover:text-white transition-all duration-300"
              >
                Login
              </Link>
            </div>
            <div className="md:hidden flex items-center">
              <button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="text-gray-600 hover:text-blue-600 transition-colors duration-300"
              >
                <svg
                  className="h-6 w-6"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d={
                      isMenuOpen
                        ? "M6 18L18 6M6 6l12 12"
                        : "M4 6h16M4 12h16M4 18h16"
                    }
                  />
                </svg>
              </button>
            </div>
          </div>
          {/* Mobile Menu */}
          <div
            className={`md:hidden transition-all duration-300 ease-in-out ${
              isMenuOpen
                ? "max-h-64 opacity-100"
                : "max-h-0 opacity-0 overflow-hidden"
            }`}
          >
            <div className="px-2 pt-2 pb-3 space-y-1">
              <a
                href="#"
                className="block px-3 py-2 text-gray-600 hover:text-blue-600 transition-colors duration-300"
              >
                Home
              </a>
              <a
                href="#services"
                className="block px-3 py-2 text-gray-600 hover:text-blue-600 transition-colors duration-300"
              >
                Services
              </a>
              <a
                href="#about"
                className="block px-3 py-2 text-gray-600 hover:text-blue-600 transition-colors duration-300"
              >
                About
              </a>
              <a
                href="#contact"
                className="block px-3 py-2 text-gray-600 hover:text-blue-600 transition-colors duration-300"
              >
                Contact
              </a>
              <Link
                href="/login"
                className="block px-3 py-2 text-blue-600 hover:text-blue-800 transition-colors duration-300"
              >
                Login
              </Link>
              <Link
                href="/signup"
                className="block px-3 py-2 text-blue-600 hover:text-blue-800 transition-colors duration-300"
              >
                Sign Up
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative min-h-[calc(100vh-4rem)] flex items-center justify-center bg-gradient-to-br from-blue-900 via-blue-800 to-blue-900 pt-16">
        <div className="absolute inset-0 bg-black/40"></div>
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#ffffff33_1px,transparent_1px)] [background-size:16px_16px]"></div>
        <div className="relative max-w-content mx-auto px-4 sm:px-6 z-10">
          <div className="text-center max-w-3xl mx-auto animate-fade-in">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6 leading-tight text-shadow">
              Engineering Excellence for
              <span className="bg-gradient-to-r from-blue-200 to-blue-400 bg-clip-text text-transparent">
                {" "}
                Tomorrow's World
              </span>
            </h1>
            <p className="text-lg md:text-xl lg:text-2xl text-blue-100 mb-12 leading-relaxed max-w-2xl mx-auto">
              Innovative solutions that transform challenges into opportunities.
              We provide cutting-edge engineering consultancy services to help
              businesses thrive.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button className="btn-primary">Get Started</button>
              <button className="bg-transparent border-2 border-white text-white px-8 py-3 rounded-lg font-semibold hover:bg-white/10 transition-all duration-300">
                Learn More
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section id="services" className="section-padding bg-gray-50">
        <div className="container-custom">
          <div className="text-center max-w-3xl mx-auto mb-16 animate-fade-in">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Our Services
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Comprehensive engineering solutions tailored to your needs
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* Service Cards */}
            <div className="card animate-slide-up">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex-center mb-6 text-blue-600">
                <svg
                  className="w-6 h-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
                  />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">
                Property Valuation
              </h3>
              <p className="text-gray-600 leading-relaxed">
                Expert property assessment and valuation services for
                residential, commercial, and industrial properties. We provide
                accurate, market-driven valuations you can trust.
              </p>
            </div>

            <div className="card animate-slide-up [animation-delay:200ms]">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex-center mb-6 text-blue-600">
                <svg
                  className="w-6 h-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
                  />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">
                Structural Engineering
              </h3>
              <p className="text-gray-600 leading-relaxed">
                Expert structural analysis and design for buildings and
                infrastructure projects. We ensure safety, efficiency, and
                innovation in every project.
              </p>
            </div>

            <div className="card animate-slide-up [animation-delay:400ms]">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex-center mb-6 text-blue-600">
                <svg
                  className="w-6 h-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M13 10V3L4 14h7v7l9-11h-7z"
                  />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">
                Electrical Engineering
              </h3>
              <p className="text-gray-600 leading-relaxed">
                Comprehensive electrical system design and power distribution
                solutions. We power your success with innovative electrical
                engineering.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section id="contact" className="section-padding bg-white">
        <div className="container-custom">
          <div className="max-w-3xl mx-auto">
            <div className="text-center mb-16 animate-fade-in">
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                Ready to Start Your Project?
              </h2>
              <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                Get in touch with our team of experts and let's bring your
                vision to life
              </p>
            </div>
            <div className="bg-gray-50 rounded-2xl p-8 md:p-12 shadow-card animate-slide-up">
              <form className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Name
                    </label>
                    <input
                      type="text"
                      className="input-field"
                      placeholder="Your name"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Email
                    </label>
                    <input
                      type="email"
                      className="input-field"
                      placeholder="your@email.com"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Message
                  </label>
                  <textarea
                    rows={4}
                    className="input-field"
                    placeholder="Tell us about your project"
                  ></textarea>
                </div>
                <div>
                  <button className="btn-primary w-full">Send Message</button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white pt-16 pb-12">
        <div className="max-w-content mx-auto px-4 sm:px-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
            <div>
              <h3 className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-blue-200 bg-clip-text text-transparent mb-6">
                EngiCon
              </h3>
              <p className="text-gray-400 leading-relaxed">
                Leading engineering consultancy delivering innovative solutions
                across multiple industries.
              </p>
            </div>
            <div>
              <h4 className="text-lg font-semibold mb-6">Quick Links</h4>
              <ul className="space-y-4">
                <li>
                  <a
                    href="#services"
                    className="text-gray-400 hover:text-white transition-colors duration-300"
                  >
                    Services
                  </a>
                </li>
                <li>
                  <a
                    href="#about"
                    className="text-gray-400 hover:text-white transition-colors duration-300"
                  >
                    About Us
                  </a>
                </li>
                <li>
                  <a
                    href="#contact"
                    className="text-gray-400 hover:text-white transition-colors duration-300"
                  >
                    Contact
                  </a>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="text-lg font-semibold mb-6">Services</h4>
              <ul className="space-y-4">
                <li className="text-gray-400">Property Valuation</li>
                <li className="text-gray-400">Structural Engineering</li>
                <li className="text-gray-400">Electrical Engineering</li>
                <li className="text-gray-400">Project Management</li>
              </ul>
            </div>
            <div>
              <h4 className="text-lg font-semibold mb-6">Contact Info</h4>
              <ul className="space-y-4">
                <li className="text-gray-400 flex items-center">
                  <svg
                    className="w-5 h-5 mr-3"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z"
                      clipRule="evenodd"
                    />
                  </svg>
                  123 Engineering Street
                </li>
                <li className="text-gray-400 flex items-center">
                  <svg
                    className="w-5 h-5 mr-3"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z" />
                  </svg>
                  +1 (555) 123-4567
                </li>
                <li className="text-gray-400 flex items-center">
                  <svg
                    className="w-5 h-5 mr-3"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
                    <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
                  </svg>
                  info@engicon.com
                </li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-12 pt-8 text-center">
            <p className="text-gray-400">
              © {new Date().getFullYear()} EngiCon. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
