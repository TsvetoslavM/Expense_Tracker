import React from 'react';
import Link from 'next/link';
import { Heart, Github, Facebook, Instagram, Mail, AlertCircle } from 'lucide-react';

export default function SimpleFooter() {
  const currentYear = new Date().getFullYear();
  
  return (
    <footer className="bg-gradient-to-r from-gray-50 to-gray-100 border-t border-gray-200 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Company Info */}
          <div>
            <h3 className="text-sm font-semibold text-gray-800 uppercase tracking-wider">Expense Tracker</h3>
            <p className="mt-4 text-sm text-gray-600 leading-relaxed">
              Simplify your financial life with our intuitive expense tracking platform. 
              Take control of your spending and reach your financial goals.
            </p>
            <div className="mt-4 flex items-center text-sm text-gray-600">
              <span>Made with</span>
              <Heart className="h-4 w-4 text-red-500 mx-1 animate-pulse" />
              <span>for better financial management</span>
            </div>
          </div>
          
          {/* Quick Links */}
          <div>
            <h3 className="text-sm font-semibold text-gray-800 uppercase tracking-wider">Quick Links</h3>
            <ul className="mt-4 space-y-3">
              <li>
                <Link href="/" className="text-sm text-gray-600 hover:text-indigo-600 transition-colors duration-200 flex items-center">
                  <span className="bg-indigo-100 p-1 rounded-md mr-2">
                    <svg className="h-3 w-3 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                    </svg>
                  </span>
                  Dashboard
                </Link>
              </li>
              <li>
                <Link href="/expenses" className="text-sm text-gray-600 hover:text-indigo-600 transition-colors duration-200 flex items-center">
                  <span className="bg-indigo-100 p-1 rounded-md mr-2">
                    <svg className="h-3 w-3 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </span>
                  Expenses
                </Link>
              </li>
              <li>
                <Link href="/budgets" className="text-sm text-gray-600 hover:text-indigo-600 transition-colors duration-200 flex items-center">
                  <span className="bg-indigo-100 p-1 rounded-md mr-2">
                    <svg className="h-3 w-3 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                    </svg>
                  </span>
                  Budgets
                </Link>
              </li>
              <li>
                <Link href="/reports" className="text-sm text-gray-600 hover:text-indigo-600 transition-colors duration-200 flex items-center">
                  <span className="bg-indigo-100 p-1 rounded-md mr-2">
                    <svg className="h-3 w-3 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                    </svg>
                  </span>
                  Reports
                </Link>
              </li>
              <li>
                <Link href="/settings" className="text-sm text-gray-600 hover:text-indigo-600 transition-colors duration-200 flex items-center">
                  <span className="bg-indigo-100 p-1 rounded-md mr-2">
                    <svg className="h-3 w-3 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                  </span>
                  Settings
                </Link>
              </li>
            </ul>
          </div>
          
          {/* Connect With Me */}
          <div>
            <h3 className="text-sm font-semibold text-gray-800 uppercase tracking-wider">Connect With Me</h3>
            <div className="mt-4 flex space-x-4">
              <a href="https://github.com/TsvetoslavM" className="text-gray-500 hover:text-gray-700 transition-colors duration-200">
                <span className="sr-only">Github</span>
                <Github className="h-6 w-6" />
              </a>
              <a href="https://www.instagram.com/cvetomc" className="text-gray-500 hover:text-gray-700 transition-colors duration-200">
                <span className="sr-only">Instagram</span>
                <Instagram className="h-6 w-6" />
              </a>
              <a href="https://www.facebook.com/profile.php?id=100083105913901" className="text-gray-500 hover:text-gray-700 transition-colors duration-200" target="_blank" rel="noopener noreferrer">
                <span className="sr-only">Facebook</span>
                <Facebook className="h-6 w-6" />
              </a>
            </div>
            
            <div className="mt-8">
              <h4 className="text-sm font-medium text-gray-800">Contact Information</h4>
              <div className="mt-4 space-y-3 text-sm text-gray-600">
                <p className="flex items-center">
                  <svg className="h-4 w-4 text-indigo-600 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                  zwetoslaw@gmail.com
                </p>
                <p className="flex items-center">
                  <svg className="h-4 w-4 text-indigo-600 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                  </svg>
                  +359 8879 1400
                </p>
              </div>
            </div>
          </div>
        </div>
        
        <div className="mt-12 pt-8 border-t border-gray-200 flex flex-col md:flex-row justify-between items-center">
          <p className="text-sm text-gray-500">
            &copy; {currentYear} Expense Tracker. Created by Tsvetoslav Makaveev. All rights reserved.
          </p>
          <div className="mt-4 md:mt-0 flex space-x-6">
            <Link href="/" className="text-xs text-gray-500 hover:text-indigo-600">
              Privacy Policy
            </Link>
            <Link href="/" className="text-xs text-gray-500 hover:text-indigo-600">
              Terms of Service
            </Link>
            <Link href="/" className="text-xs text-gray-500 hover:text-indigo-600">
              Cookie Policy
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
} 