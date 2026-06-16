"use client";

import { Root as VisuallyHidden } from "@radix-ui/react-visually-hidden";
import { useRouter } from "next/navigation";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";

export function InterceptedDialog({
	children,
	title = "Dialog",
}: {
	children: React.ReactNode;
	title?: string;
}) {
	const router = useRouter();

	return (
		<Dialog open onOpenChange={(open) => !open && router.back()}>
			<DialogContent className="max-w-3xl max-h-[calc(100vh-10rem)] overflow-y-auto">
				<VisuallyHidden>
					<DialogTitle>{title}</DialogTitle>
				</VisuallyHidden>
				{children}
			</DialogContent>
		</Dialog>
	);
}
