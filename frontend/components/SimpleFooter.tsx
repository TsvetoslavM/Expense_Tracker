import React from 'react';
import Link from 'next/link';
import { Heart } from 'lucide-react';

export default function SimpleFooter() {
  const currentYear = new Date().getFullYear();
  
  return (
    <footer className="bg-white border-t border-gray-200 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row justify-between items-center">
          <p className="text-sm text-gray-500">
            &copy; {currentYear} Expense Tracker. All rights reserved.
          </p>
          <div className="mt-4 md:mt-0 flex items-center text-sm text-gray-500">
            <span>Made with</span>
            <Heart className="h-4 w-4 text-red-500 mx-1" />
            <span>for better financial management</span>
          </div>
        </div>
        <div className="mt-8 flex justify-center space-x-6">
          <Link href="/" className="text-sm text-gray-500 hover:text-indigo-600">
            Dashboard
          </Link>
          <Link href="/expenses" className="text-sm text-gray-500 hover:text-indigo-600">
            Expenses
          </Link>
          <Link href="/reports" className="text-sm text-gray-500 hover:text-indigo-600">
            Reports
          </Link>
          <Link href="/settings" className="text-sm text-gray-500 hover:text-indigo-600">
            Settings
          </Link>
        </div>
      </div>
    </footer>
  );
} 