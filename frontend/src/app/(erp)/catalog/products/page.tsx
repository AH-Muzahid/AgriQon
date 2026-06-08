'use client';

import React, { useState } from 'react';
import { PageShell } from '@/components/page-shell';
import { DataTable } from '@/components/data-table/data-table';
import { StatusBadge } from '@/components/status-badge';
import { MOCK_PRODUCTS, MockProduct } from '@/lib/mock-erp-data';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Eye, Plus, FilterX } from 'lucide-react';
import { toast } from 'sonner';

export default function ProductsPage() {
  const [products, setProducts] = useState<MockProduct[]>(MOCK_PRODUCTS);
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('ALL');
  const [selectedProduct, setSelectedProduct] = useState<MockProduct | null>(null);
  const [sheetOpen, setSheetOpen] = useState(false);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);

  // Form states
  const [newProduct, setNewProduct] = useState({
    sku: '',
    name: '',
    category: '',
    brand: '',
    costPrice: '',
    sellingPrice: '',
    description: '',
  });

  // Filter products based on search and category
  const filteredProducts = products.filter((p) => {
    const matchesSearch =
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.sku.toLowerCase().includes(search.toLowerCase()) ||
      p.brand.toLowerCase().includes(search.toLowerCase());
    const matchesCategory = categoryFilter === 'ALL' || p.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  const categories = Array.from(new Set(products.map((p) => p.category)));

  const handleCreateProduct = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProduct.sku || !newProduct.name || !newProduct.costPrice || !newProduct.sellingPrice) {
      toast.error('Please fill in all required fields');
      return;
    }

    const created: MockProduct = {
      sku: newProduct.sku,
      name: newProduct.name,
      category: newProduct.category || 'Uncategorized',
      brand: newProduct.brand || 'Generic',
      costPrice: parseFloat(newProduct.costPrice),
      sellingPrice: parseFloat(newProduct.sellingPrice),
      status: 'ACTIVE',
      description: newProduct.description || 'No description provided.',
    };

    setProducts([created, ...products]);
    setCreateDialogOpen(false);
    toast.success(`Product ${created.sku} registered successfully`);
    
    // Reset form
    setNewProduct({
      sku: '',
      name: '',
      category: '',
      brand: '',
      costPrice: '',
      sellingPrice: '',
      description: '',
    });
  };

  const columns = [
    {
      header: 'SKU',
      accessor: (row: MockProduct) => (
        <span className="font-mono text-xs font-semibold">{row.sku}</span>
      ),
    },
    {
      header: 'Product Name',
      accessor: (row: MockProduct) => (
        <span className="font-semibold text-foreground">{row.name}</span>
      ),
    },
    {
      header: 'Category',
      accessor: (row: MockProduct) => (
        <span className="text-muted-foreground">{row.category}</span>
      ),
    },
    {
      header: 'Brand',
      accessor: (row: MockProduct) => (
        <span className="text-muted-foreground">{row.brand}</span>
      ),
    },
    {
      header: 'Cost Price',
      accessor: (row: MockProduct) => (
        <span className="font-mono">৳{row.costPrice.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
      ),
    },
    {
      header: 'Selling Price',
      accessor: (row: MockProduct) => (
        <span className="font-mono font-semibold">৳{row.sellingPrice.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
      ),
    },
    {
      header: 'Status',
      accessor: (row: MockProduct) => (
        <StatusBadge status={row.status} />
      ),
    },
    {
      header: 'Actions',
      accessor: (row: MockProduct) => (
        <Button
          variant="outline"
          size="sm"
          className="h-8 gap-1.5 cursor-pointer text-xs"
          onClick={() => {
            setSelectedProduct(row);
            setSheetOpen(true);
          }}
        >
          <Eye className="h-3.5 w-3.5" />
          View Details
        </Button>
      ),
      className: "text-right"
    },
  ];

  return (
    <React.Fragment>
      <PageShell
        title="Products Catalog"
        description="Maintain unified SKU descriptions, pricing structures, and status flags across all warehouses."
        actions={
          <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button className="gap-2 cursor-pointer font-semibold shadow-sm">
                <Plus className="h-4 w-4" />
                Register SKU
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>Register Master SKU</DialogTitle>
                <DialogDescription>Define a new agricultural item in the central catalog repository.</DialogDescription>
              </DialogHeader>
              <form onSubmit={handleCreateProduct} className="grid gap-4 py-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-1.5">
                    <Label htmlFor="sku">SKU Code *</Label>
                    <Input
                      id="sku"
                      placeholder="e.g. AGR-NPK-002"
                      value={newProduct.sku}
                      onChange={(e) => setNewProduct({ ...newProduct, sku: e.target.value })}
                      required
                    />
                  </div>
                  <div className="grid gap-1.5">
                    <Label htmlFor="brand">Brand</Label>
                    <Input
                      id="brand"
                      placeholder="e.g. SoilVigor"
                      value={newProduct.brand}
                      onChange={(e) => setNewProduct({ ...newProduct, brand: e.target.value })}
                    />
                  </div>
                </div>

                <div className="grid gap-1.5">
                  <Label htmlFor="name">Product Name *</Label>
                  <Input
                    id="name"
                    placeholder="e.g. Concentrated Potassium Fertilizer"
                    value={newProduct.name}
                    onChange={(e) => setNewProduct({ ...newProduct, name: e.target.value })}
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-1.5">
                    <Label htmlFor="costPrice">Cost Price (৳) *</Label>
                    <Input
                      id="costPrice"
                      type="number"
                      placeholder="0.00"
                      value={newProduct.costPrice}
                      onChange={(e) => setNewProduct({ ...newProduct, costPrice: e.target.value })}
                      required
                    />
                  </div>
                  <div className="grid gap-1.5">
                    <Label htmlFor="sellingPrice">Selling Price (৳) *</Label>
                    <Input
                      id="sellingPrice"
                      type="number"
                      placeholder="0.00"
                      value={newProduct.sellingPrice}
                      onChange={(e) => setNewProduct({ ...newProduct, sellingPrice: e.target.value })}
                      required
                    />
                  </div>
                </div>

                <div className="grid gap-1.5">
                  <Label htmlFor="category">Category</Label>
                  <Input
                    id="category"
                    placeholder="e.g. Fertilizer"
                    value={newProduct.category}
                    onChange={(e) => setNewProduct({ ...newProduct, category: e.target.value })}
                  />
                </div>

                <div className="grid gap-1.5">
                  <Label htmlFor="description">Product Description</Label>
                  <Input
                    id="description"
                    placeholder="Provide granular application specifications..."
                    value={newProduct.description}
                    onChange={(e) => setNewProduct({ ...newProduct, description: e.target.value })}
                  />
                </div>

                <DialogFooter className="mt-4">
                  <Button type="button" variant="outline" onClick={() => setCreateDialogOpen(false)}>Cancel</Button>
                  <Button type="submit">Save Product</Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        }
      >
        <DataTable
          data={filteredProducts}
          columns={columns}
          searchPlaceholder="Search by product name, SKU, brand..."
          searchValue={search}
          onSearchChange={setSearch}
          filters={
            <div className="flex items-center gap-2">
              <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                <SelectTrigger className="w-40 h-10 bg-background text-xs">
                  <SelectValue placeholder="All Categories" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ALL" className="text-xs">All Categories</SelectItem>
                  {categories.map((c) => (
                    <SelectItem key={c} value={c} className="text-xs">{c}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {categoryFilter !== 'ALL' && (
                <Button variant="ghost" size="icon" className="h-10 w-10 text-destructive cursor-pointer" onClick={() => setCategoryFilter('ALL')}>
                  <FilterX className="h-4 w-4" />
                </Button>
              )}
            </div>
          }
          emptyStateTitle="No Products Registered"
          emptyStateDescription="Add products to your catalog to track inventory quantities and values across warehouses."
        />
      </PageShell>

      {/* Product Detail Sidebar Sheet */}
      <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
        <SheetContent className="sm:max-w-md">
          {selectedProduct && (
            <React.Fragment>
              <SheetHeader className="border-b pb-4">
                <div className="flex items-center gap-2">
                  <span className="font-mono text-xs text-muted-foreground bg-muted px-2 py-0.5 rounded">
                    {selectedProduct.sku}
                  </span>
                  <StatusBadge status={selectedProduct.status} />
                </div>
                <SheetTitle className="text-xl font-bold mt-2">{selectedProduct.name}</SheetTitle>
                <SheetDescription>Granular catalog metadata and application definitions.</SheetDescription>
              </SheetHeader>
              <div className="py-6 space-y-6 text-sm">
                <div className="grid grid-cols-2 gap-4 border-b pb-4">
                  <div>
                    <span className="text-xs font-semibold text-muted-foreground uppercase block">Category</span>
                    <span className="font-medium">{selectedProduct.category}</span>
                  </div>
                  <div>
                    <span className="text-xs font-semibold text-muted-foreground uppercase block">Brand</span>
                    <span className="font-medium">{selectedProduct.brand}</span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 border-b pb-4">
                  <div>
                    <span className="text-xs font-semibold text-muted-foreground uppercase block">Cost Price</span>
                    <span className="font-mono font-medium">৳{selectedProduct.costPrice.toFixed(2)}</span>
                  </div>
                  <div>
                    <span className="text-xs font-semibold text-muted-foreground uppercase block">Selling Price</span>
                    <span className="font-mono font-bold text-primary">৳{selectedProduct.sellingPrice.toFixed(2)}</span>
                  </div>
                </div>

                <div>
                  <span className="text-xs font-semibold text-muted-foreground uppercase block mb-1">Product Description</span>
                  <p className="text-xs leading-relaxed text-muted-foreground bg-muted/30 p-3 rounded-lg border">
                    {selectedProduct.description}
                  </p>
                </div>
              </div>
            </React.Fragment>
          )}
        </SheetContent>
      </Sheet>
    </React.Fragment>
  );
}
