'use client';

import { useState } from 'react';
import Image from 'next/image';
import Logo from './components/Logo';

type SearchType = 'rollNumber' | 'name' | 'course';

type StudentResult = {
  name: string;
  rollNumber: string;
  available: boolean;
};

type SingleResultType = {
  available: boolean;
  name?: string;
  address?: string;
  notes?: string;
  rollNumber?: string;
  course?: string;
  multipleResults: false;
};

type MultipleResultType = {
  course: string;
  multipleResults: true;
  students: StudentResult[];
};

type ResultType = SingleResultType | MultipleResultType | null;

export default function Home() {
  const [searchType, setSearchType] = useState<SearchType>('rollNumber');
  const [searchValue, setSearchValue] = useState('');
  const [result, setResult] = useState<ResultType>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!searchValue.trim()) {
      setError(`Please enter a ${searchType === 'rollNumber' ? 'roll number' : searchType === 'name' ? 'name' : 'course'}`);
      return;
    }

    setLoading(true);
    setError('');
    setResult(null);

    try {
      const response = await fetch(`/api/check-marksheet?${searchType}=${encodeURIComponent(searchValue)}`);
      const data = await response.json();
      
      if (response.ok) {
        setResult(data);
      } else {
        setError(data.error || 'Failed to check marksheet availability');
      }
    } catch (err) {
      setError('Failed to connect to the server. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Render single student result
  const renderSingleResult = (result: SingleResultType) => (
    <div className="mt-8 rounded-xl border bg-white shadow-lg overflow-hidden">
      <div className={`p-4 ${result.available ? 'bg-green-50' : 'bg-amber-50'}`}>
        <div className="flex items-center">
          <div className={`flex-shrink-0 ${result.available ? 'text-green-500' : 'text-amber-500'}`}>
            {result.available ? (
              <svg className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            ) : (
              <svg className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            )}
          </div>
          <div className="ml-3">
            <h3 className="text-lg font-medium text-gray-900">
              {result.available ? 'Marksheet Available' : 'Marksheet Not Available'}
            </h3>
          </div>
        </div>
      </div>
      
      <div className="border-t border-gray-200 px-6 py-4">
        <dl className="divide-y divide-gray-200">
          {result.name && (
            <div className="py-3 flex flex-col sm:flex-row sm:justify-between">
              <dt className="text-sm font-medium text-gray-500 mb-1 sm:mb-0">Name</dt>
              <dd className="text-sm text-gray-900">{result.name}</dd>
            </div>
          )}
          
          {result.rollNumber && (
            <div className="py-3 flex flex-col sm:flex-row sm:justify-between">
              <dt className="text-sm font-medium text-gray-500 mb-1 sm:mb-0">Roll Number</dt>
              <dd className="text-sm text-gray-900">{result.rollNumber}</dd>
            </div>
          )}
          
          {result.course && (
            <div className="py-3 flex flex-col sm:flex-row sm:justify-between">
              <dt className="text-sm font-medium text-gray-500 mb-1 sm:mb-0">Course</dt>
              <dd className="text-sm text-gray-900">{result.course}</dd>
            </div>
          )}
          
          {result.address && (
            <div className="py-3 flex flex-col sm:flex-row sm:justify-between">
              <dt className="text-sm font-medium text-gray-500 mb-1 sm:mb-0">Address</dt>
              <dd className="text-sm text-gray-900">{result.address}</dd>
            </div>
          )}
        </dl>

        {result.available && (
          <div className="mt-3 p-3 bg-green-50 rounded-md text-sm text-green-700">
            Your marksheet is ready for collection. Please bring your ID card.
          </div>
        )}
        
        {!result.available && (
          <div className="mt-3 p-3 bg-amber-50 rounded-md text-sm text-amber-700">
            Your marksheet is not yet available. Please check again later.
          </div>
        )}

        {result.notes && (
          <div className="mt-3">
            <h4 className="text-sm font-medium text-gray-700 mb-1">Notes</h4>
            <div className="text-sm text-gray-700 bg-gray-50 p-3 rounded-md border border-gray-100">
              {result.notes}
            </div>
          </div>
        )}
      </div>
    </div>
  );

  // Render multiple student results (course search)
  const renderCourseResults = (result: MultipleResultType) => (
    <div className="mt-8 rounded-xl border bg-white shadow-lg overflow-hidden">
      <div className="p-4 bg-indigo-50">
        <div className="flex items-center">
          <div className="flex-shrink-0 text-indigo-500">
            <svg className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
            </svg>
          </div>
          <div className="ml-3">
            <h3 className="text-lg font-medium text-gray-900">
              Results for Course: {result.course}
            </h3>
            <p className="text-sm text-gray-600">
              {result.students.length} student{result.students.length !== 1 ? 's' : ''} found
            </p>
          </div>
        </div>
      </div>
      
      <div className="border-t border-gray-200 px-4 py-4">
        <div className="overflow-hidden border-b border-gray-200 sm:rounded-lg">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Name
                </th>
                <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Roll Number
                </th>
                <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {result.students.map((student, index) => (
                <tr key={index} className="hover:bg-gray-50">
                  <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">
                    {student.name}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">
                    {student.rollNumber}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    {student.available ? (
                      <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                        Available
                      </span>
                    ) : (
                      <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-amber-100 text-amber-800">
                        Not Available
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        <div className="mt-4 p-3 bg-gray-50 rounded-md text-sm text-gray-600">
          <p className="font-medium">Note:</p>
          <p>Students with "Available" status can collect their marksheets from the administration office. Please bring your ID card for verification.</p>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-slate-50 to-slate-100">
      {/* Header */}
      <header className="bg-indigo-800 text-white shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="py-4 flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center flex-shrink-0 mb-4 md:mb-0">
              <Logo />
            </div>
            <nav className="flex space-x-6 text-sm">
              <a href="#" className="hover:text-indigo-200 transition-colors duration-200">Home</a>
              <a href="#" className="hover:text-indigo-200 transition-colors duration-200">About</a>
              <a href="#" className="hover:text-indigo-200 transition-colors duration-200">Student Portal</a>
              <a href="#" className="hover:text-indigo-200 transition-colors duration-200">Contact</a>
            </nav>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-grow flex flex-col items-center py-8 px-4 sm:px-6 lg:px-8">
        <div className="w-full max-w-3xl space-y-8">
          <div className="text-center">
            <h1 className="mt-4 text-3xl md:text-4xl font-bold text-indigo-700 tracking-tight">
              Marksheet Finder
            </h1>
            <p className="mt-3 text-base text-gray-600">
              Check if your marksheet is available for collection
            </p>
          </div>
          
          <div className="mt-8 bg-white shadow-lg rounded-xl p-6 border border-gray-100">
            <form className="space-y-6" onSubmit={handleSearch}>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">Search by</label>
                <div className="flex flex-wrap gap-3 mb-4">
                  <button
                    type="button"
                    onClick={() => setSearchType('rollNumber')}
                    className={`px-4 py-2 rounded-md text-sm ${
                      searchType === 'rollNumber'
                        ? 'bg-indigo-600 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    } transition-colors duration-200`}
                  >
                    Roll Number
                  </button>
                  <button
                    type="button"
                    onClick={() => setSearchType('name')}
                    className={`px-4 py-2 rounded-md text-sm ${
                      searchType === 'name'
                        ? 'bg-indigo-600 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    } transition-colors duration-200`}
                  >
                    Name
                  </button>
                  <button
                    type="button"
                    onClick={() => setSearchType('course')}
                    className={`px-4 py-2 rounded-md text-sm ${
                      searchType === 'course'
                        ? 'bg-indigo-600 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    } transition-colors duration-200`}
                  >
                    Course
                  </button>
                </div>
                
                <label htmlFor="search-value" className="block text-sm font-medium text-gray-700 mb-1">
                  {searchType === 'rollNumber' ? 'Roll Number' : searchType === 'name' ? 'Student Name' : 'Course'}
                </label>
                <input
                  id="search-value"
                  type="text"
                  required
                  className="appearance-none rounded-lg relative block w-full px-4 py-3 border border-gray-300 placeholder-gray-400 text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm shadow-sm transition-all duration-200"
                  placeholder={`Enter ${searchType === 'rollNumber' ? 'roll number' : searchType === 'name' ? 'student name' : 'course name'}`}
                  value={searchValue}
                  onChange={(e) => setSearchValue(e.target.value)}
                />
                {searchType === 'name' && (
                  <p className="mt-1 text-xs text-gray-500">Enter full name exactly as registered</p>
                )}
                {searchType === 'course' && (
                  <p className="mt-1 text-xs text-gray-500">Shows all students in the course with marksheet status</p>
                )}
              </div>

              <div>
                <button
                  type="submit"
                  disabled={loading}
                  className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:bg-indigo-300 transition-colors duration-200 shadow-sm"
                >
                  {loading ? (
                    <>
                      <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Searching...
                    </>
                  ) : 'Check Marksheet'}
                </button>
              </div>
            </form>

            {error && (
              <div className="mt-4 text-center p-3 text-sm text-red-600 bg-red-50 rounded-md">
                {error}
              </div>
            )}
          </div>

          {result && (
            result.multipleResults 
              ? renderCourseResults(result) 
              : renderSingleResult(result)
          )}
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-indigo-900 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div>
              <h3 className="text-lg font-semibold mb-4">NIMS University</h3>
              <p className="text-sm text-indigo-200">
                A premier university dedicated to excellence in education and research.
              </p>
              <div className="mt-4 flex space-x-4">
                <a href="#" className="text-indigo-200 hover:text-white">
                  <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M22.675 0h-21.35c-.732 0-1.325.593-1.325 1.325v21.351c0 .731.593 1.324 1.325 1.324h11.495v-9.294h-3.128v-3.622h3.128v-2.671c0-3.1 1.893-4.788 4.659-4.788 1.325 0 2.463.099 2.795.143v3.24l-1.918.001c-1.504 0-1.795.715-1.795 1.763v2.313h3.587l-.467 3.622h-3.12v9.293h6.116c.73 0 1.323-.593 1.323-1.325v-21.35c0-.732-.593-1.325-1.325-1.325z" />
                  </svg>
                </a>
                <a href="#" className="text-indigo-200 hover:text-white">
                  <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723 10.1 10.1 0 01-3.127 1.184 4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z" />
                  </svg>
                </a>
                <a href="#" className="text-indigo-200 hover:text-white">
                  <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 0C8.74 0 8.333.015 7.053.072 5.775.132 4.905.333 4.14.63c-.789.306-1.459.717-2.126 1.384S.935 3.35.63 4.14C.333 4.905.131 5.775.072 7.053.012 8.333 0 8.74 0 12s.015 3.667.072 4.947c.06 1.277.261 2.148.558 2.913.306.788.717 1.459 1.384 2.126.667.666 1.336 1.079 2.126 1.384.766.296 1.636.499 2.913.558C8.333 23.988 8.74 24 12 24s3.667-.015 4.947-.072c1.277-.06 2.148-.262 2.913-.558.788-.306 1.459-.718 2.126-1.384.666-.667 1.079-1.335 1.384-2.126.296-.765.499-1.636.558-2.913.06-1.28.072-1.687.072-4.947s-.015-3.667-.072-4.947c-.06-1.277-.262-2.149-.558-2.913-.306-.789-.718-1.459-1.384-2.126C21.319 1.347 20.651.935 19.86.63c-.765-.297-1.636-.499-2.913-.558C15.667.012 15.26 0 12 0zm0 2.16c3.203 0 3.585.016 4.85.071 1.17.055 1.805.249 2.227.415.562.217.96.477 1.382.896.419.42.679.819.896 1.381.164.422.36 1.057.413 2.227.057 1.266.07 1.646.07 4.85s-.015 3.585-.074 4.85c-.061 1.17-.256 1.805-.421 2.227-.224.562-.479.96-.899 1.382-.419.419-.824.679-1.38.896-.42.164-1.065.36-2.235.413-1.274.057-1.649.07-4.859.07-3.211 0-3.586-.015-4.859-.074-1.171-.061-1.816-.256-2.236-.421-.569-.224-.96-.479-1.379-.899-.421-.419-.69-.824-.9-1.38-.165-.42-.359-1.065-.42-2.235-.045-1.26-.061-1.649-.061-4.844 0-3.196.016-3.586.061-4.861.061-1.17.255-1.814.42-2.234.21-.57.479-.96.9-1.381.419-.419.81-.689 1.379-.898.42-.166 1.051-.361 2.221-.421 1.275-.045 1.65-.06 4.859-.06l.045.03zm0 3.678c-3.405 0-6.162 2.76-6.162 6.162 0 3.405 2.76 6.162 6.162 6.162 3.405 0 6.162-2.76 6.162-6.162 0-3.405-2.76-6.162-6.162-6.162zM12 16c-2.21 0-4-1.79-4-4s1.79-4 4-4 4 1.79 4 4-1.79 4-4 4zm7.846-10.405c0 .795-.646 1.44-1.44 1.44-.795 0-1.44-.646-1.44-1.44 0-.794.646-1.439 1.44-1.439.793-.001 1.44.645 1.44 1.439z" />
                  </svg>
                </a>
              </div>
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-4">NIET College</h3>
              <p className="text-sm text-indigo-200 mb-4">
                National Institute of Engineering and Technology, fostering innovation and technical expertise.
              </p>
              <ul className="text-sm text-indigo-200 space-y-2">
                <li>
                  <a href="#" className="hover:text-white transition-colors duration-200">Academic Programs</a>
                </li>
                <li>
                  <a href="#" className="hover:text-white transition-colors duration-200">Admissions</a>
                </li>
                <li>
                  <a href="#" className="hover:text-white transition-colors duration-200">Campus Life</a>
                </li>
                <li>
                  <a href="#" className="hover:text-white transition-colors duration-200">Research</a>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-4">Contact Us</h3>
              <p className="text-sm text-indigo-200 mb-2">
                <span className="block">NIMS University Road,</span>
                <span className="block">Jaipur, Rajasthan 303121</span>
              </p>
              <p className="text-sm text-indigo-200 mb-4">
                <span className="block">Email: info@nimsuniversity.org</span>
                <span className="block">Phone: +91-1234567890</span>
              </p>
              <a href="#" className="inline-block bg-indigo-700 hover:bg-indigo-600 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors duration-200">
                Contact Administration
              </a>
            </div>
          </div>
          <div className="mt-8 pt-4 border-t border-indigo-800 text-center text-xs text-indigo-300">
            <p>© {new Date().getFullYear()} NIMS University. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
