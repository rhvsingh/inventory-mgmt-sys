"use server";

import "server-only";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";

import { logActivity } from "@/actions/audit";
import { auth } from "@/auth";
import { type AuthUser, Authz } from "@/lib/access";
import { prisma } from "@/lib/prisma";

const adjustmentSchema = z.object({
	productId: z.string(),
	qtyChange: z.coerce.number().int(),
	reason: z.string().min(1, "Reason is required"),
});

export async function createAdjustment(formData: FormData) {
	const rawData = {
		productId: formData.get("productId"),
		qtyChange: formData.get("qtyChange"),
		reason: formData.get("reason"),
	};

	const validatedData = adjustmentSchema.safeParse(rawData);

	if (!validatedData.success) {
		return { error: "Invalid data" };
	}

	const { productId, qtyChange, reason } = validatedData.data;

	const session = await auth();
	if (!session?.user?.id) {
		return { error: "Unauthorized: Please log in." };
	}

	const product = await prisma.product.findUnique({
		where: { id: productId },
	});
	if (!product) {
		return { error: "Product not found" };
	}

	const authCheck = Authz.check(
		session.user as AuthUser,
		"adjustments:create",
		{
			adjustment: { qtyChange },
			product,
		},
	);
	if (!authCheck.authorized) {
		return { error: authCheck.reason || "Unauthorized" };
	}

	// SEC-04: Prevent negative stock
	if (product.stockQty + qtyChange < 0) {
		return {
			error: `Insufficient stock for "${product.name}". Available: ${product.stockQty}, requested change: ${qtyChange}.`,
		};
	}

	const userId = session.user.id;

	try {
		await prisma.$transaction(async (tx) => {
			// 1. Create Adjustment Record
			await tx.adjustment.create({
				data: {
					productId,
					qtyChange,
					reason,
					userId,
				},
			});

			// 2. Update Product Stock
			await tx.product.update({
				where: { id: productId },
				data: {
					stockQty: {
						increment: qtyChange,
					},
				},
			});
		});
		await logActivity("ADJUSTMENT_CREATE", {
			productId,
			qtyChange,
			reason,
			productName: product.name,
		});
	} catch (error) {
		console.error("Adjustment failed:", error);
		return { error: "Adjustment failed" };
	}

	revalidatePath("/products");
	redirect("/products");
}
