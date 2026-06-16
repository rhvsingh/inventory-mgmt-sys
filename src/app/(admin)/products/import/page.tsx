import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import ImportProductsPage from "./import-client";

export const metadata: Metadata = {
	title: "Import Products",
};

export default async function ImportProductsServerPage() {
	const session = await auth();
	if (!session || !session.user.permissions?.includes("products:import")) {
		redirect("/products");
	}

	return <ImportProductsPage />;
}
