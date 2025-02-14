
import { ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";

const Index = () => {
  return (
    <div className="min-h-screen pt-16 fadeIn">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center">
          <h1 className="text-4xl font-bold mb-4">Bem-vindo ao MoldesKeeper</h1>
          <p className="text-xl text-muted-foreground mb-8">
            Gerencie seus clientes e moldes de forma simples e eficiente
          </p>
          <div className="grid md:grid-cols-2 gap-8 mt-12">
            <Link
              to="/clientes"
              className="p-6 glass rounded-lg hover-scale group"
            >
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-2xl font-semibold">Clientes</h2>
                <ArrowRight className="h-6 w-6 text-primary group-hover:translate-x-2 transition-transform" />
              </div>
              <p className="text-muted-foreground">
                Cadastre e gerencie seus clientes
              </p>
            </Link>
            <Link
              to="/moldes"
              className="p-6 glass rounded-lg hover-scale group"
            >
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-2xl font-semibold">Moldes</h2>
                <ArrowRight className="h-6 w-6 text-primary group-hover:translate-x-2 transition-transform" />
              </div>
              <p className="text-muted-foreground">
                Cadastre e gerencie os moldes dos clientes
              </p>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Index;
