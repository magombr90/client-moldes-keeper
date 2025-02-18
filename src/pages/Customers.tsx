
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PlusCircle, Search, UserPlus, ArrowRight, Pencil, Trash2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
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
  const [newCustomer, setNewCustomer] = useState({ name: "" });
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null);
  const [deletingCustomer, setDeletingCustomer] = useState<Customer | null>(null);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch customers
  const { data: customers = [] } = useQuery({
    queryKey: ['customers'],
    queryFn: async () => {
      console.log('Fetching customers...');
      const { data, error } = await supabase
        .from('customers')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching customers:', error);
        throw error;
      }
      console.log('Customers fetched:', data);
      return data;
    },
  });

  // Fetch molds for selected customer
  const { data: customerMolds = [] } = useQuery({
    queryKey: ['molds', selectedCustomer?.id],
    queryFn: async () => {
      if (!selectedCustomer?.id) return [];
      
      console.log('Fetching molds for customer:', selectedCustomer.id);
      const { data, error } = await supabase
        .from('molds')
        .select('*')
        .eq('customer_id', selectedCustomer.id)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching molds:', error);
        throw error;
      }
      console.log('Molds fetched:', data);
      return data;
    },
    enabled: !!selectedCustomer?.id,
  });

  // Create customer mutation
  const createCustomer = useMutation({
    mutationFn: async (customer: { name: string }) => {
      console.log('Creating customer:', customer);
      const { data, error } = await supabase
        .from('customers')
        .insert([customer])
        .select()
        .single();

      if (error) {
        console.error('Error creating customer:', error);
        throw error;
      }
      console.log('Customer created:', data);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['customers'] });
      toast({
        title: "Sucesso",
        description: "Cliente cadastrado com sucesso",
      });
      setIsCreateOpen(false);
      setNewCustomer({ name: "" }); // Reset form
    },
    onError: (error: Error) => {
      console.error('Create customer error:', error);
      toast({
        title: "Erro",
        description: `Erro ao cadastrar cliente: ${error.message}`,
        variant: "destructive",
      });
    },
  });

  // Update customer mutation
  const updateCustomer = useMutation({
    mutationFn: async (customer: Customer) => {
      console.log('Updating customer:', customer);
      const { data, error } = await supabase
        .from('customers')
        .update({ name: customer.name })
        .eq('id', customer.id)
        .select()
        .single();

      if (error) {
        console.error('Error updating customer:', error);
        throw error;
      }
      console.log('Customer updated:', data);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['customers'] });
      toast({
        title: "Sucesso",
        description: "Cliente atualizado com sucesso",
      });
      setIsEditOpen(false);
      setEditingCustomer(null); // Reset form
    },
    onError: (error: Error) => {
      console.error('Update customer error:', error);
      toast({
        title: "Erro",
        description: `Erro ao atualizar cliente: ${error.message}`,
        variant: "destructive",
      });
    },
  });

  // Delete customer mutation
  const deleteCustomer = useMutation({
    mutationFn: async (id: string) => {
      console.log('Deleting customer:', id);
      const { error } = await supabase
        .from('customers')
        .delete()
        .eq('id', id);

      if (error) {
        console.error('Error deleting customer:', error);
        throw error;
      }
      console.log('Customer deleted successfully');
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['customers'] });
      toast({
        title: "Sucesso",
        description: "Cliente excluído com sucesso",
      });
      setDeletingCustomer(null);
    },
    onError: (error: Error) => {
      console.error('Delete customer error:', error);
      toast({
        title: "Erro",
        description: `Erro ao excluir cliente: ${error.message}`,
        variant: "destructive",
      });
    },
  });

  const handleCreate = () => {
    if (!newCustomer.name) {
      toast({
        title: "Erro",
        description: "Preencha o nome do cliente",
        variant: "destructive",
      });
      return;
    }

    createCustomer.mutate(newCustomer);
  };

  const handleEdit = () => {
    if (!editingCustomer || !editingCustomer.name) {
      toast({
        title: "Erro",
        description: "Preencha o nome do cliente",
        variant: "destructive",
      });
      return;
    }

    updateCustomer.mutate(editingCustomer);
  };

  const handleDelete = () => {
    if (!deletingCustomer) return;
    deleteCustomer.mutate(deletingCustomer.id);
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
          <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
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
              className="p-4 glass rounded-lg hover-scale"
            >
              <div className="flex justify-between items-center">
                <div className="cursor-pointer flex-1" onClick={() => setSelectedCustomer(customer)}>
                  <p className="text-sm text-muted-foreground">
                    Código: {customer.code}
                  </p>
                  <h3 className="text-lg font-semibold">{customer.name}</h3>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => {
                      setEditingCustomer(customer);
                      setIsEditOpen(true);
                    }}
                  >
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setDeletingCustomer(customer)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setSelectedCustomer(customer)}
                  >
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                </div>
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

      {/* Edit Dialog */}
      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Editar Cliente</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Nome</label>
              <Input
                value={editingCustomer?.name || ""}
                onChange={(e) =>
                  setEditingCustomer(
                    editingCustomer ? 
                    { ...editingCustomer, name: e.target.value } : 
                    null
                  )
                }
                placeholder="Digite o nome do cliente"
              />
            </div>
            <Button 
              onClick={handleEdit} 
              className="w-full"
              disabled={updateCustomer.isPending}
            >
              {updateCustomer.isPending ? "Atualizando..." : "Atualizar Cliente"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete Alert */}
      <AlertDialog open={!!deletingCustomer} onOpenChange={() => setDeletingCustomer(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Tem certeza?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta ação não pode ser desfeita. Isso excluirá permanentemente o cliente 
              {deletingCustomer?.name && ` "${deletingCustomer.name}"`} e todos os seus dados.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-destructive hover:bg-destructive/90"
            >
              {deleteCustomer.isPending ? "Excluindo..." : "Excluir Cliente"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* View Molds Sheet */}
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
