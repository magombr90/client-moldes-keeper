
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
import { PlusCircle, Search, Upload } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useToast } from "@/components/ui/use-toast";

interface Mold {
  id: string;
  code: string;
  description: string;
  customerId: string;
  customerName: string;
  image: string;
}

const Molds = () => {
  const [molds, setMolds] = useState<Mold[]>([]);
  const [search, setSearch] = useState("");
  const [newMold, setNewMold] = useState({
    code: "",
    description: "",
    customerId: "",
    image: "",
  });
  const { toast } = useToast();

  // Simulated customers data - this would come from your customer state/API
  const customers = [
    { id: "1", name: "Cliente Exemplo 1" },
    { id: "2", name: "Cliente Exemplo 2" },
  ];

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setNewMold({ ...newMold, image: reader.result as string });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleCreate = () => {
    if (!newMold.code || !newMold.description || !newMold.customerId) {
      toast({
        title: "Erro",
        description: "Preencha todos os campos",
        variant: "destructive",
      });
      return;
    }

    const customer = customers.find((c) => c.id === newMold.customerId);
    if (!customer) return;

    const mold = {
      id: Math.random().toString(36).substr(2, 9),
      ...newMold,
      customerName: customer.name,
    };

    setMolds([...molds, mold]);
    setNewMold({
      code: "",
      description: "",
      customerId: "",
      image: "",
    });
    toast({
      title: "Sucesso",
      description: "Molde cadastrado com sucesso",
    });
  };

  const filteredMolds = molds.filter(
    (mold) =>
      mold.code.toLowerCase().includes(search.toLowerCase()) ||
      mold.description.toLowerCase().includes(search.toLowerCase()) ||
      mold.customerName.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="min-h-screen pt-16 fadeIn">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">Moldes</h1>
          <Dialog>
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
                    value={newMold.customerId}
                    onValueChange={(value) =>
                      setNewMold({ ...newMold, customerId: value })
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
                          onChange={handleImageUpload}
                        />
                      </label>
                    )}
                  </div>
                </div>
                <Button onClick={handleCreate} className="w-full">
                  Cadastrar Molde
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
                  <p className="text-sm text-muted-foreground">
                    Código: {mold.code}
                  </p>
                  <h3 className="text-lg font-semibold mb-1">{mold.description}</h3>
                  <p className="text-sm text-muted-foreground">
                    Cliente: {mold.customerName}
                  </p>
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
    </div>
  );
};

export default Molds;
