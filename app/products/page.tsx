import { createClient } from "@/lib/supabase/server";
import ProductsManager from "@/components/products/ProductsManager";
import { getCurrentUser } from "@/lib/auth";
import { redirect } from "next/navigation";

export default async function ProductsPage() {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login");
  }

  const supabase = await createClient();

  const { data: products } = await supabase
    .from("products")
    .select("*")
    .order("product_id");

  return (
    <ProductsManager
      initialProducts={products ?? []}
      canManage={user.role === "admin" || user.role === "supervisor"}
    />
  );
}
