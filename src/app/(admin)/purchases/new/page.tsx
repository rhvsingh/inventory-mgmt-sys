import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import NewPurchasePage from "./new-purchase-client";

export const metadata: Metadata = {
	title: "Record Purchase",
};

export default async function NewPurchaseServerPage() {
	const session = await auth();
	if (!session || !session.user.permissions?.includes("transactions:create")) {
		redirect("/purchases");
	}

	return <NewPurchasePage />;
}
