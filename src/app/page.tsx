import { redirect } from "next/navigation";

// Root page redirects to the demo restaurant/table
export default function RootPage() {
  redirect("/rest_demo_001/menu/1");
}
