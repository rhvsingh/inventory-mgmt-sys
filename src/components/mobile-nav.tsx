"use client";

import { Menu, Package } from "lucide-react";
import { useState } from "react";
import { Sidebar } from "@/components/Sidebar";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";

export function MobileNav({
	user,
}: {
	user: {
		name?: string | null;
		email?: string | null;
		role?: string;
	};
}) {
	const [open, setOpen] = useState(false);

	return (
		<div className="flex items-center gap-4 border-b bg-background px-4 py-3 md:hidden">
			<Sheet open={open} onOpenChange={setOpen}>
				<SheetTrigger asChild>
					<Button variant="outline" size="icon" className="shrink-0">
						<Menu className="h-5 w-5" />
						<span className="sr-only">Toggle navigation menu</span>
					</Button>
				</SheetTrigger>
				<SheetContent
					side="left"
					className="p-0 border-r-0 bg-transparent shadow-none w-auto"
				>
					{/* Render Sidebar within Sheet, passing onClose to close sheet on link click */}
					<Sidebar
						className="w-64 border-r bg-card h-full rounded-r-lg"
						onClose={() => setOpen(false)}
						user={user}
					/>
				</SheetContent>
			</Sheet>
			<div className="flex items-center gap-2 font-semibold">
				<Package className="h-6 w-6" />
				<span>Sports Shop IMS</span>
			</div>
		</div>
	);
}
