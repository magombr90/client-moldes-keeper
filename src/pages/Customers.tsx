
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { Customer } from "@/types/customer";
import { CustomerList } from "@/components/customers/CustomerList";
import { CustomerCreate } from "@/components/customers/CustomerCreate";
import { CustomerEdit } from "@/components/customers/CustomerEdit";
import { CustomerDelete } from "@/components/customers/CustomerDelete";
import { CustomerMolds } from "@/components/customers/CustomerMolds";

const Customers = () => {
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null);
  const [deletingCustomer, setDeletingCustomer] = useState<Customer | null>(null);
  const [isEditOpen, setIsEditOpen] = useState(false);

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

  return (
    <div className="min-h-screen pt-16 fadeIn">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">Clientes</h1>
          <CustomerCreate />
        </div>

        <CustomerList 
          customers={customers}
          onEdit={(customer) => {
            setEditingCustomer(customer);
            setIsEditOpen(true);
          }}
          onDelete={setDeletingCustomer}
          onSelect={setSelectedCustomer}
        />
      </div>

      <CustomerEdit 
        customer={editingCustomer}
        isOpen={isEditOpen}
        onOpenChange={(open) => {
          setIsEditOpen(open);
          if (!open) setEditingCustomer(null);
        }}
      />

      <CustomerDelete 
        customer={deletingCustomer}
        onOpenChange={(open) => {
          if (!open) setDeletingCustomer(null);
        }}
      />

      <CustomerMolds 
        customer={selectedCustomer}
        onOpenChange={(open) => {
          if (!open) setSelectedCustomer(null);
        }}
      />
    </div>
  );
};

export default Customers;
