
import React from 'react'
import Link from 'next/link'

const NotFound = () => {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center">
      <h1 className="text-6xl font-bold mb-4">404</h1>
      <h2 className="text-2xl mb-8">Page Not Found</h2>
      <p className="text-gray-600 mb-8">The page you are looking for does not exist.</p>
      <Link href="/">
        <button className="bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2 px-4 rounded">
          Return to Home
        </button>
      </Link>
    </div>
  )
}

export default NotFound