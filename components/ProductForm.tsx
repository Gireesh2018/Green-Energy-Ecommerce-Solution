import React, { useEffect } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { z } from "zod";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "./Dialog";
import {
  Form,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
  FormDescription,
  useForm,
} from "./Form";
import { Input } from "./Input";
import { Textarea } from "./Textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./Select";
import { Button } from "./Button";
import { postProductsCreate } from "../endpoints/products/create_POST.schema";
import { postProductsUpdate } from "../endpoints/products/update_POST.schema";
import { getProductsList } from "../endpoints/products/list_GET.schema";
import styles from "./ProductForm.module.css";

const productFormSchema = z.object({
  title: z.string().min(1, "Product title is required").max(255, "Title too long"),
  description: z.string().optional(),
  category: z.enum([
    "Two-Wheeler Batteries",
    "Four-Wheeler Batteries", 
    "Inverters",
    "Solar PCU",
    "UPS Battery",
    "Inverter Trolley",
    "Battery Tray",
    "Others"
  ], { required_error: "Please select a category" }),
  brand: z.string().min(1, "Brand is required").max(100, "Brand name too long"),
  imageUrl: z.string().url("Invalid image URL").optional().or(z.literal("")),
  dpPrice: z.number().positive("DP price must be positive"),
  mrpPrice: z.number().positive("MRP price must be positive"),
  stock: z.number().int().min(0, "Stock cannot be negative"),
  tags: z.string().optional(),
  specifications: z.string().optional(),
}).refine(data => data.dpPrice <= data.mrpPrice, {
  message: "DP price cannot be higher than MRP price",
  path: ["dpPrice"]
});

type ProductFormData = z.infer<typeof productFormSchema>;

interface ProductFormProps {
  isOpen: boolean;
  onClose: () => void;
  productId?: number;
  onSuccess: () => void;
}

export const ProductForm: React.FC<ProductFormProps> = ({
  isOpen,
  onClose,
  productId,
  onSuccess,
}) => {
  const queryClient = useQueryClient();
  const isEditing = !!productId;

  console.log("ProductForm: Rendering with productId:", productId, "isEditing:", isEditing);

  // Fetch existing product data for editing
  const { data: existingProduct, isLoading: isLoadingProduct } = useQuery({
    queryKey: ["products", "list", { search: "", page: 1, limit: 1000 }],
    queryFn: () => getProductsList({ page: 1, limit: 1000 }),
    enabled: isEditing && isOpen,
    select: (data) => data.products.find(p => p.id === productId),
  });

  const form = useForm({
    defaultValues: {
      title: "",
      description: "",
      category: "Others" as const,
      brand: "",
      imageUrl: "",
      dpPrice: 0,
      mrpPrice: 0,
      stock: 0,
      tags: "",
      specifications: "",
    },
    schema: productFormSchema,
  });

  // Update form when existing product data is loaded
  useEffect(() => {
    if (existingProduct && isEditing) {
      console.log("ProductForm: Setting form values from existing product:", existingProduct);
      form.setValues({
        title: existingProduct.title,
        description: existingProduct.description || "",
        category: existingProduct.category as any,
        brand: existingProduct.brand,
        imageUrl: existingProduct.imageUrl || "",
        dpPrice: existingProduct.dpPrice,
        mrpPrice: existingProduct.mrpPrice,
        stock: existingProduct.stock,
        tags: existingProduct.tags?.join(", ") || "",
        specifications: existingProduct.specifications ? JSON.stringify(existingProduct.specifications, null, 2) : "",
      });
    } else if (!isEditing) {
      // Reset form for new product
      console.log("ProductForm: Resetting form for new product");
      form.setValues({
        title: "",
        description: "",
        category: "Others" as const,
        brand: "",
        imageUrl: "",
        dpPrice: 0,
        mrpPrice: 0,
        stock: 0,
        tags: "",
        specifications: "",
      });
    }
  }, [existingProduct, isEditing, form.setValues]);

  const createMutation = useMutation({
    mutationFn: postProductsCreate,
    onSuccess: () => {
      console.log("ProductForm: Product created successfully");
      queryClient.invalidateQueries({ queryKey: ["products"] });
      onSuccess();
      onClose();
    },
    onError: (error) => {
      console.error("ProductForm: Error creating product:", error);
      form.setFieldError("title", error instanceof Error ? error.message : "Failed to create product");
    },
  });

  const updateMutation = useMutation({
    mutationFn: postProductsUpdate,
    onSuccess: () => {
      console.log("ProductForm: Product updated successfully");
      queryClient.invalidateQueries({ queryKey: ["products"] });
      onSuccess();
      onClose();
    },
    onError: (error) => {
      console.error("ProductForm: Error updating product:", error);
      form.setFieldError("title", error instanceof Error ? error.message : "Failed to update product");
    },
  });

  const handleSubmit = (data: ProductFormData) => {
    console.log("ProductForm: Submitting form data:", data);
    
    // Parse tags and specifications
    const tags = data.tags ? data.tags.split(",").map(tag => tag.trim()).filter(Boolean) : [];
    let specifications: Record<string, any> | undefined;
    
    if (data.specifications) {
      try {
        specifications = JSON.parse(data.specifications);
      } catch (error) {
        console.error("ProductForm: Invalid JSON in specifications:", error);
        form.setFieldError("specifications", "Invalid JSON format");
        return;
      }
    }

    const productData = {
      title: data.title,
      description: data.description || undefined,
      category: data.category,
      brand: data.brand,
      imageUrl: data.imageUrl || undefined,
      dpPrice: data.dpPrice,
      mrpPrice: data.mrpPrice,
      stock: data.stock,
      tags,
      specifications,
    };

    if (isEditing && productId) {
      updateMutation.mutate({
        id: productId,
        ...productData,
      });
    } else {
      createMutation.mutate(productData);
    }
  };

  const handleClose = () => {
    console.log("ProductForm: Closing form");
    form.setValues({
      title: "",
      description: "",
      category: "Others" as const,
      brand: "",
      imageUrl: "",
      dpPrice: 0,
      mrpPrice: 0,
      stock: 0,
      tags: "",
      specifications: "",
    });
    onClose();
  };

  const isSubmitting = createMutation.isPending || updateMutation.isPending;

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className={styles.dialogContent}>
        <DialogHeader>
          <DialogTitle>
            {isEditing ? "Edit Product" : "Create New Product"}
          </DialogTitle>
        </DialogHeader>

        {isLoadingProduct && isEditing ? (
          <div className={styles.loadingContainer}>
            <p>Loading product data...</p>
          </div>
        ) : (
          <Form {...form}>
            <form onSubmit={form.handleSubmit(handleSubmit)} className={styles.form}>
              <div className={styles.formGrid}>
                <FormItem name="title">
                  <FormLabel>Product Title *</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Enter product title"
                      value={form.values.title}
                      onChange={(e) => form.setValues(prev => ({ ...prev, title: e.target.value }))}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>

                <FormItem name="brand">
                  <FormLabel>Brand *</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Enter brand name"
                      value={form.values.brand}
                      onChange={(e) => form.setValues(prev => ({ ...prev, brand: e.target.value }))}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>

                <FormItem name="category">
                  <FormLabel>Category *</FormLabel>
                  <FormControl>
                    <Select
                      value={form.values.category}
                      onValueChange={(value) => form.setValues(prev => ({ ...prev, category: value as any }))}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Two-Wheeler Batteries">Two-Wheeler Batteries</SelectItem>
                        <SelectItem value="Four-Wheeler Batteries">Four-Wheeler Batteries</SelectItem>
                        <SelectItem value="Inverters">Inverters</SelectItem>
                        <SelectItem value="Solar PCU">Solar PCU</SelectItem>
                        <SelectItem value="UPS Battery">UPS Battery</SelectItem>
                        <SelectItem value="Inverter Trolley">Inverter Trolley</SelectItem>
                        <SelectItem value="Battery Tray">Battery Tray</SelectItem>
                        <SelectItem value="Others">Others</SelectItem>
                      </SelectContent>
                    </Select>
                  </FormControl>
                  <FormMessage />
                </FormItem>

                <FormItem name="imageUrl">
                  <FormLabel>Image URL</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="https://example.com/image.jpg"
                      value={form.values.imageUrl}
                      onChange={(e) => form.setValues(prev => ({ ...prev, imageUrl: e.target.value }))}
                    />
                  </FormControl>
                  <FormDescription>Optional: URL to product image</FormDescription>
                  <FormMessage />
                </FormItem>

                <FormItem name="dpPrice">
                  <FormLabel>DP Price (₹) *</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      placeholder="0"
                      value={form.values.dpPrice || ""}
                      onChange={(e) => form.setValues(prev => ({ ...prev, dpPrice: parseFloat(e.target.value) || 0 }))}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>

                <FormItem name="mrpPrice">
                  <FormLabel>MRP Price (₹) *</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      placeholder="0"
                      value={form.values.mrpPrice || ""}
                      onChange={(e) => form.setValues(prev => ({ ...prev, mrpPrice: parseFloat(e.target.value) || 0 }))}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>

                <FormItem name="stock">
                  <FormLabel>Stock Quantity *</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      placeholder="0"
                      value={form.values.stock || ""}
                      onChange={(e) => form.setValues(prev => ({ ...prev, stock: parseInt(e.target.value) || 0 }))}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>

                <FormItem name="tags">
                  <FormLabel>Tags</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="tag1, tag2, tag3"
                      value={form.values.tags}
                      onChange={(e) => form.setValues(prev => ({ ...prev, tags: e.target.value }))}
                    />
                  </FormControl>
                  <FormDescription>Comma-separated tags for the product</FormDescription>
                  <FormMessage />
                </FormItem>
              </div>

              <FormItem name="description">
                <FormLabel>Description</FormLabel>
                <FormControl>
                  <Textarea
                    placeholder="Enter product description"
                    value={form.values.description}
                    onChange={(e) => form.setValues(prev => ({ ...prev, description: e.target.value }))}
                    rows={4}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>

              <FormItem name="specifications">
                <FormLabel>Specifications (JSON)</FormLabel>
                <FormControl>
                  <Textarea
                    placeholder='{"capacity": "100Ah", "voltage": "12V"}'
                    value={form.values.specifications}
                    onChange={(e) => form.setValues(prev => ({ ...prev, specifications: e.target.value }))}
                    rows={6}
                  />
                </FormControl>
                <FormDescription>Optional: Product specifications in JSON format</FormDescription>
                <FormMessage />
              </FormItem>

              <DialogFooter>
                <Button type="button" variant="outline" onClick={handleClose}>
                  Cancel
                </Button>
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? "Saving..." : isEditing ? "Update Product" : "Create Product"}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        )}
      </DialogContent>
    </Dialog>
  );
};