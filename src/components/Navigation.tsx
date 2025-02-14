
import { Home, Users, Box } from "lucide-react";
import { Link, useLocation } from "react-router-dom";

export const Navigation = () => {
  const location = useLocation();

  const isActive = (path: string) => {
    return location.pathname === path;
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 glass">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center">
            <Link to="/" className="flex items-center space-x-2">
              <Box className="h-8 w-8" />
              <span className="font-semibold text-xl">MoldesKeeper</span>
            </Link>
          </div>
          <div className="flex space-x-8">
            <Link
              to="/"
              className={`flex items-center space-x-1 hover:text-primary transition-colors ${
                isActive("/") ? "text-primary" : ""
              }`}
            >
              <Home className="h-5 w-5" />
              <span>Início</span>
            </Link>
            <Link
              to="/clientes"
              className={`flex items-center space-x-1 hover:text-primary transition-colors ${
                isActive("/clientes") ? "text-primary" : ""
              }`}
            >
              <Users className="h-5 w-5" />
              <span>Clientes</span>
            </Link>
            <Link
              to="/moldes"
              className={`flex items-center space-x-1 hover:text-primary transition-colors ${
                isActive("/moldes") ? "text-primary" : ""
              }`}
            >
              <Box className="h-5 w-5" />
              <span>Moldes</span>
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
};
