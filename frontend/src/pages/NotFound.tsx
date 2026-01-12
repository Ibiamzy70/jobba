
import { useLocation, Link } from "react-router-dom";
import { useEffect } from "react";
import NavBar from '@/components/NavBar';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error(
      "404 Error: User attempted to access non-existent route:",
      location.pathname
    );
  }, [location.pathname]);

  return (
    <div className="min-h-screen flex flex-col">
      <NavBar />
      <main className="flex-1 flex items-center justify-center py-12 bg-gray-50">
        <div className="text-center px-6">
          <h1 className="text-9xl font-bold text-brand-600">404</h1>
          <p className="text-2xl font-semibold text-gray-900 mt-4">Page not found</p>
          <p className="text-gray-600 mt-2 mb-6 max-w-md mx-auto">
            The page you're looking for doesn't exist or has been moved.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <Link to="/">
              <Button className="bg-brand-600 hover:bg-brand-700 text-white w-full sm:w-auto">
                Back to Home
              </Button>
            </Link>
            <Link to="/jobs">
              <Button variant="outline" className="border-brand-200 text-brand-700 hover:bg-brand-50 w-full sm:w-auto">
                Explore Jobs
              </Button>
            </Link>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default NotFound;
