import { NextPageContext } from 'next';
import Link from 'next/link';

function Error({ statusCode }: { statusCode?: number }) {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 p-4">
      <h1 className="text-6xl font-bold text-red-600 mb-4">{statusCode || 'Error'}</h1>
      <h2 className="text-2xl font-semibold mb-2">{statusCode ? `An error ${statusCode} occurred on server` : 'An error occurred on client'}</h2>
      <p className="mb-6 text-gray-600 text-center max-w-md">Sorry, something went wrong. Please try again later or return to the home page.</p>
      <Link href="/" className="px-4 py-2 bg-blue-600 text-white rounded shadow hover:bg-blue-700">Go Home</Link>
    </div>
  );
}

Error.getInitialProps = ({ res, err }: NextPageContext) => {
  const statusCode = res ? res.statusCode : err ? err.statusCode : 404;
  return { statusCode };
};

export default Error; 