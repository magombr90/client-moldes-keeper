
import { Customer } from "@/types/customer";
import { Mold } from "@/types/mold";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";

interface CustomerMoldsProps {
  customer: Customer | null;
  onOpenChange: (open: boolean) => void;
}

export function CustomerMolds({ customer, onOpenChange }: CustomerMoldsProps) {
  const { data: customerMolds = [] } = useQuery({
    queryKey: ['molds', customer?.id],
    queryFn: async () => {
      if (!customer?.id) return [];
      
      console.log('Fetching molds for customer:', customer.id);
      const { data, error } = await supabase
        .from('molds')
        .select('*')
        .eq('customer_id', customer.id)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching molds:', error);
        throw error;
      }
      console.log('Molds fetched:', data);
      return data;
    },
    enabled: !!customer?.id,
  });

  return (
    <Sheet open={!!customer} onOpenChange={onOpenChange}>
      <SheetContent className="w-full sm:max-w-xl">
        <SheetHeader>
          <SheetTitle>Histórico de Moldes - {customer?.name}</SheetTitle>
        </SheetHeader>
        <div className="mt-6">
          <div className="space-y-4">
            {customerMolds.map((mold: Mold) => (
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
  );
}
