
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { PlusCircle, Search, Upload, Pencil, Trash2 } from "lucide-react";
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
  customerName?: string;
}

const Molds = () => {
  const [search, setSearch] = useState("");
  const [newMold, setNewMold] = useState({
    code: "",
    description: "",
    customer_id: "",
    image: "",
  });
  const [editingMold, setEditingMold] = useState<Mold | null>(null);
  const [deletingMold, setDeletingMold] = useState<Mold | null>(null);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
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

  // Fetch molds
  const { data: molds = [] } = useQuery({
    queryKey: ['molds'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('molds')
        .select(`
          *,
          customers (
            name
          )
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data.map((mold) => ({
        ...mold,
        customerName: mold.customers.name,
      }));
    },
  });

  // Create mold mutation
  const createMold = useMutation({
    mutationFn: async (mold: Omit<Mold, 'id'>) => {
      if (!mold.code) {
        throw new Error("O código do molde é obrigatório");
      }

      const { data, error } = await supabase
        .from('molds')
        .insert([mold])
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['molds'] });
      toast({
        title: "Sucesso",
        description: "Molde cadastrado com sucesso",
      });
      setIsCreateOpen(false);
    },
    onError: (error) => {
      toast({
        title: "Erro",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Update mold mutation
  const updateMold = useMutation({
    mutationFn: async (mold: Mold) => {
      if (!mold.code) {
        throw new Error("O código do molde é obrigatório");
      }

      const { data, error } = await supabase
        .from('molds')
        .update({
          code: mold.code,
          description: mold.description,
          customer_id: mold.customer_id,
          image: mold.image,
        })
        .eq('id', mold.id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['molds'] });
      toast({
        title: "Sucesso",
        description: "Molde atualizado com sucesso",
      });
      setIsEditOpen(false);
    },
    onError: (error) => {
      toast({
        title: "Erro",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Delete mold mutation
  const deleteMold = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('molds')
        .delete()
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['molds'] });
      toast({
        title: "Sucesso",
        description: "Molde excluído com sucesso",
      });
      setDeletingMold(null);
    },
    onError: (error) => {
      toast({
        title: "Erro",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>, target: 'new' | 'edit') => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        if (target === 'new') {
          setNewMold({ ...newMold, image: reader.result as string });
        } else {
          setEditingMold(editingMold ? 
            { ...editingMold, image: reader.result as string } : 
            null
          );
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleCreate = () => {
    if (!newMold.code || !newMold.description || !newMold.customer_id) {
      toast({
        title: "Erro",
        description: "Preencha todos os campos obrigatórios",
        variant: "destructive",
      });
      return;
    }

    createMold.mutate(newMold);
    setNewMold({
      code: "",
      description: "",
      customer_id: "",
      image: "",
    });
  };

  const handleEdit = () => {
    if (!editingMold || !editingMold.code || !editingMold.description || !editingMold.customer_id) {
      toast({
        title: "Erro",
        description: "Preencha todos os campos obrigatórios",
        variant: "destructive",
      });
      return;
    }

    updateMold.mutate(editingMold);
  };

  const handleDelete = () => {
    if (!deletingMold) return;
    deleteMold.mutate(deletingMold.id);
  };

  const filteredMolds = molds.filter(
    (mold) =>
      mold.code.toLowerCase().includes(search.toLowerCase()) ||
      mold.description.toLowerCase().includes(search.toLowerCase()) ||
      mold.customerName?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="min-h-screen pt-16 fadeIn">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">Moldes</h1>
          <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
            <DialogTrigger asChild>
              <Button className="flex items-center space-x-2">
                <PlusCircle className="h-5 w-5" />
                <span>Novo Molde</span>
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle>Novo Molde</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Código</label>
                  <Input
                    value={newMold.code}
                    onChange={(e) =>
                      setNewMold({ ...newMold, code: e.target.value })
                    }
                    placeholder="Digite o código do molde"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Descrição</label>
                  <Textarea
                    value={newMold.description}
                    onChange={(e) =>
                      setNewMold({ ...newMold, description: e.target.value })
                    }
                    placeholder="Digite a descrição do molde"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Cliente</label>
                  <Select
                    value={newMold.customer_id}
                    onValueChange={(value) =>
                      setNewMold({ ...newMold, customer_id: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione um cliente" />
                    </SelectTrigger>
                    <SelectContent>
                      {customers.map((customer) => (
                        <SelectItem key={customer.id} value={customer.id}>
                          {customer.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Foto</label>
                  <div className="flex items-center justify-center border-2 border-dashed rounded-lg p-4">
                    {newMold.image ? (
                      <img
                        src={newMold.image}
                        alt="Preview"
                        className="max-h-40 object-contain"
                      />
                    ) : (
                      <label className="flex flex-col items-center cursor-pointer">
                        <Upload className="h-12 w-12 text-muted-foreground mb-2" />
                        <span className="text-sm text-muted-foreground">
                          Clique para fazer upload
                        </span>
                        <input
                          type="file"
                          className="hidden"
                          accept="image/*"
                          onChange={(e) => handleImageUpload(e, 'new')}
                        />
                      </label>
                    )}
                  </div>
                </div>
                <Button 
                  onClick={handleCreate} 
                  className="w-full"
                  disabled={createMold.isPending}
                >
                  {createMold.isPending ? "Cadastrando..." : "Cadastrar Molde"}
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
              placeholder="Buscar moldes..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-4">
          {filteredMolds.map((mold) => (
            <div
              key={mold.id}
              className="p-4 glass rounded-lg hover-scale"
            >
              <div className="flex gap-4">
                {mold.image && (
                  <img
                    src={mold.image}
                    alt={mold.code}
                    className="w-24 h-24 object-cover rounded-lg"
                  />
                )}
                <div className="flex-1">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="text-sm text-muted-foreground">
                        Código: {mold.code}
                      </p>
                      <h3 className="text-lg font-semibold mb-1">{mold.description}</h3>
                      <p className="text-sm text-muted-foreground">
                        Cliente: {mold.customerName}
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => {
                          setEditingMold(mold);
                          setIsEditOpen(true);
                        }}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setDeletingMold(mold)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
          {filteredMolds.length === 0 && (
            <div className="col-span-2 text-center py-12 text-muted-foreground">
              Nenhum molde encontrado
            </div>
          )}
        </div>
      </div>

      {/* Edit Dialog */}
      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Editar Molde</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Código</label>
              <Input
                value={editingMold?.code || ""}
                onChange={(e) =>
                  setEditingMold(
                    editingMold ? 
                    { ...editingMold, code: e.target.value } : 
                    null
                  )
                }
                placeholder="Digite o código do molde"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Descrição</label>
              <Textarea
                value={editingMold?.description || ""}
                onChange={(e) =>
                  setEditingMold(
                    editingMold ? 
                    { ...editingMold, description: e.target.value } : 
                    null
                  )
                }
                placeholder="Digite a descrição do molde"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Cliente</label>
              <Select
                value={editingMold?.customer_id || ""}
                onValueChange={(value) =>
                  setEditingMold(
                    editingMold ? 
                    { ...editingMold, customer_id: value } : 
                    null
                  )
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione um cliente" />
                </SelectTrigger>
                <SelectContent>
                  {customers.map((customer) => (
                    <SelectItem key={customer.id} value={customer.id}>
                      {customer.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Foto</label>
              <div className="flex items-center justify-center border-2 border-dashed rounded-lg p-4">
                {editingMold?.image ? (
                  <img
                    src={editingMold.image}
                    alt="Preview"
                    className="max-h-40 object-contain"
                  />
                ) : (
                  <label className="flex flex-col items-center cursor-pointer">
                    <Upload className="h-12 w-12 text-muted-foreground mb-2" />
                    <span className="text-sm text-muted-foreground">
                      Clique para fazer upload
                    </span>
                    <input
                      type="file"
                      className="hidden"
                      accept="image/*"
                      onChange={(e) => handleImageUpload(e, 'edit')}
                    />
                  </label>
                )}
              </div>
            </div>
            <Button 
              onClick={handleEdit} 
              className="w-full"
              disabled={updateMold.isPending}
            >
              {updateMold.isPending ? "Atualizando..." : "Atualizar Molde"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete Alert */}
      <AlertDialog open={!!deletingMold} onOpenChange={() => setDeletingMold(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Tem certeza?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta ação não pode ser desfeita. Isso excluirá permanentemente o molde
              {deletingMold?.code && ` "${deletingMold.code}"`} e todos os seus dados.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-destructive hover:bg-destructive/90"
            >
              {deleteMold.isPending ? "Excluindo..." : "Excluir Molde"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default Molds;

