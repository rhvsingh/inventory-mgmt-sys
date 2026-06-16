import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import NewSalePage from "./new-sale-client";

export const metadata: Metadata = {
	title: "New Sale",
};

export default async function NewSaleServerPage() {
	const session = await auth();
	if (!session || !session.user.permissions?.includes("transactions:create")) {
		redirect("/sales");
	}

	return <NewSalePage />;
}
