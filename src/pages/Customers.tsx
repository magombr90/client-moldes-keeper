
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PlusCircle, Search, UserPlus, ArrowRight } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useToast } from "@/components/ui/use-toast";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { supabase } from "@/lib/supabase";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

interface Customer {
  id: string;
  code: string;
  name: string;
}

interface Mold {
  id: string;
  code: string;
  description: string;
  customer_id: string;
  image: string;
}

const Customers = () => {
  const [search, setSearch] = useState("");
  const [newCustomer, setNewCustomer] = useState({ code: "", name: "" });
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch customers
  const { data: customers = [] } = useQuery({
    queryKey: ['customers'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('customers')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data;
    },
  });

  // Fetch molds for selected customer
  const { data: customerMolds = [] } = useQuery({
    queryKey: ['molds', selectedCustomer?.id],
    queryFn: async () => {
      if (!selectedCustomer?.id) return [];
      
      const { data, error } = await supabase
        .from('molds')
        .select('*')
        .eq('customer_id', selectedCustomer.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data;
    },
    enabled: !!selectedCustomer?.id,
  });

  // Create customer mutation
  const createCustomer = useMutation({
    mutationFn: async (customer: { code: string; name: string }) => {
      const { data, error } = await supabase
        .from('customers')
        .insert([customer])
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['customers'] });
      toast({
        title: "Sucesso",
        description: "Cliente cadastrado com sucesso",
      });
    },
    onError: (error) => {
      toast({
        title: "Erro",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleCreate = () => {
    if (!newCustomer.code || !newCustomer.name) {
      toast({
        title: "Erro",
        description: "Preencha todos os campos",
        variant: "destructive",
      });
      return;
    }

    createCustomer.mutate(newCustomer);
    setNewCustomer({ code: "", name: "" });
  };

  const filteredCustomers = customers.filter(
    (customer) =>
      customer.name.toLowerCase().includes(search.toLowerCase()) ||
      customer.code.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="min-h-screen pt-16 fadeIn">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">Clientes</h1>
          <Dialog>
            <DialogTrigger asChild>
              <Button className="flex items-center space-x-2">
                <UserPlus className="h-5 w-5" />
                <span>Novo Cliente</span>
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Novo Cliente</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Código</label>
                  <Input
                    value={newCustomer.code}
                    onChange={(e) =>
                      setNewCustomer({ ...newCustomer, code: e.target.value })
                    }
                    placeholder="Digite o código do cliente"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Nome</label>
                  <Input
                    value={newCustomer.name}
                    onChange={(e) =>
                      setNewCustomer({ ...newCustomer, name: e.target.value })
                    }
                    placeholder="Digite o nome do cliente"
                  />
                </div>
                <Button 
                  onClick={handleCreate} 
                  className="w-full"
                  disabled={createCustomer.isPending}
                >
                  <PlusCircle className="h-5 w-5 mr-2" />
                  {createCustomer.isPending ? "Cadastrando..." : "Cadastrar Cliente"}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        <div className="mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            <Input
              className="pl-10"
              placeholder="Buscar clientes..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>

        <div className="grid gap-4">
          {filteredCustomers.map((customer) => (
            <div
              key={customer.id}
              className="p-4 glass rounded-lg hover-scale cursor-pointer"
              onClick={() => setSelectedCustomer(customer)}
            >
              <div className="flex justify-between items-center">
                <div>
                  <p className="text-sm text-muted-foreground">
                    Código: {customer.code}
                  </p>
                  <h3 className="text-lg font-semibold">{customer.name}</h3>
                </div>
                <ArrowRight className="h-5 w-5 text-muted-foreground" />
              </div>
            </div>
          ))}
          {filteredCustomers.length === 0 && (
            <div className="text-center py-12 text-muted-foreground">
              Nenhum cliente encontrado
            </div>
          )}
        </div>
      </div>

      <Sheet open={!!selectedCustomer} onOpenChange={() => setSelectedCustomer(null)}>
        <SheetContent className="w-full sm:max-w-xl">
          <SheetHeader>
            <SheetTitle>Histórico de Moldes - {selectedCustomer?.name}</SheetTitle>
          </SheetHeader>
          <div className="mt-6">
            <div className="space-y-4">
              {customerMolds.map((mold) => (
                <div key={mold.id} className="p-4 glass rounded-lg">
                  <div className="flex gap-4">
                    {mold.image && (
                      <img
                        src={mold.image}
                        alt={mold.code}
                        className="w-24 h-24 object-cover rounded-lg"
                      />
                    )}
                    <div className="flex-1">
                      <p className="text-sm text-muted-foreground">
                        Código: {mold.code}
                      </p>
                      <h3 className="text-lg font-semibold mb-1">
                        {mold.description}
                      </h3>
                    </div>
                  </div>
                </div>
              ))}
              {customerMolds.length === 0 && (
                <div className="text-center py-12 text-muted-foreground">
                  Nenhum molde encontrado para este cliente
                </div>
              )}
            </div>
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
};

export default Customers;
