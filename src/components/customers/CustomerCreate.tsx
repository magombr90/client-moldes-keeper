
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PlusCircle, UserPlus } from "lucide-react";
import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { useToast } from "@/components/ui/use-toast";

export function CustomerCreate() {
  const [isOpen, setIsOpen] = useState(false);
  const [newCustomer, setNewCustomer] = useState({ name: "" });
  const { toast } = useToast();
  const queryClient = useQueryClient();

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
      setIsOpen(false);
      setNewCustomer({ name: "" });
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

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
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
  );
}
