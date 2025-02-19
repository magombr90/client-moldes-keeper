
import { Customer } from "@/types/customer";
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
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { useToast } from "@/components/ui/use-toast";

interface CustomerDeleteProps {
  customer: Customer | null;
  onOpenChange: (open: boolean) => void;
}

export function CustomerDelete({ customer, onOpenChange }: CustomerDeleteProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();

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
      onOpenChange(false);
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

  const handleDelete = () => {
    if (!customer) return;
    deleteCustomer.mutate(customer.id);
  };

  return (
    <AlertDialog open={!!customer} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Tem certeza?</AlertDialogTitle>
          <AlertDialogDescription>
            Esta ação não pode ser desfeita. Isso excluirá permanentemente o cliente 
            {customer?.name && ` "${customer.name}"`} e todos os seus dados.
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
  );
}
