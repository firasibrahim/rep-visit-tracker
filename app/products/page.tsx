import { supabase } from "@/lib/supabase";
import ProductsManager from "@/components/products/ProductsManager";

export default async function ProductsPage() {
  const { data: products } = await supabase
    .from("products")
    .select("*")
    .order("product_id");

  return <ProductsManager initialProducts={products ?? []} />;
}
