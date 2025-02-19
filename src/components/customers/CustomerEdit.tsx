
import { Customer } from "@/types/customer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useState, useEffect } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { useToast } from "@/components/ui/use-toast";

interface CustomerEditProps {
  customer: Customer | null;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
}

export function CustomerEdit({ customer, isOpen, onOpenChange }: CustomerEditProps) {
  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  useEffect(() => {
    setEditingCustomer(customer);
  }, [customer]);

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
      onOpenChange(false);
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

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
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
  );
}
