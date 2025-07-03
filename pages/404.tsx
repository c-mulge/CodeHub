import Link from 'next/link';

export default function Custom404() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 p-4">
      <h1 className="text-6xl font-bold text-blue-600 mb-4">404</h1>
      <h2 className="text-2xl font-semibold mb-2">Page Not Found</h2>
      <p className="mb-6 text-gray-600 text-center max-w-md">Sorry, the page you are looking for does not exist or has been moved.</p>
      <Link href="/" className="px-4 py-2 bg-blue-600 text-white rounded shadow hover:bg-blue-700">Go Home</Link>
    </div>
  );
} 