"use client"

import { Pencil, PlusCircle } from "lucide-react"
import { useState } from "react"
import { useFormStatus } from "react-dom"
import { toast } from "sonner"
import { createRole, updateRole } from "@/actions/role"
import { Button } from "@/components/ui/button"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

function SubmitButton({ isEdit }: { isEdit: boolean }) {
    const { pending } = useFormStatus()
    return (
        <Button type="submit" disabled={pending} className="cursor-pointer">
            {pending ? "Saving..." : isEdit ? "Save Changes" : "Create Role"}
        </Button>
    )
}

interface RoleDialogProps {
    role?: {
        id: string
        name: string
        description: string | null
        permissions: { permission: { name: string } }[]
    }
    allPermissions: { id: string; name: string; description: string | null }[]
}

const permissionGroups = [
    {
        title: "Catalog & Products",
        permissions: [
            "products:create",
            "products:read",
            "products:update",
            "products:archive",
            "products:delete",
            "products:import",
        ],
    },
    {
        title: "Transactions & Stock Adjustments",
        permissions: [
            "transactions:create",
            "transactions:create_purchase",
            "transactions:read",
            "adjustments:create",
            "adjustments:create_unbounded",
        ],
    },
    {
        title: "User Management",
        permissions: ["users:create", "users:read", "users:update", "users:delete"],
    },
    {
        title: "Role Management",
        permissions: ["roles:create", "roles:read", "roles:update", "roles:delete"],
    },
    {
        title: "Reports & Insights",
        permissions: ["reports:low_stock", "reports:valuation", "reports:history"],
    },
    {
        title: "System Alerts",
        permissions: ["notifications:read"],
    },
    {
        title: "Customers & Suppliers",
        permissions: [
            "customers:create",
            "customers:read",
            "customers:update",
            "customers:delete",
            "suppliers:create",
            "suppliers:read",
            "suppliers:update",
            "suppliers:delete",
        ],
    },
    {
        title: "Audit Logs",
        permissions: ["audit_logs:read"],
    },
]

export function RoleDialog({ role, allPermissions }: RoleDialogProps) {
    const [open, setOpen] = useState(false)
    const isEdit = !!role

    // Keep track of which permissions are checked
    const initialChecked = role ? role.permissions.map((p) => p.permission.name) : []
    const [checkedPerms, setCheckedPerms] = useState<string[]>(initialChecked)

    const handleCheckboxChange = (name: string, checked: boolean) => {
        if (checked) {
            setCheckedPerms((prev) => [...prev, name])
        } else {
            setCheckedPerms((prev) => prev.filter((p) => p !== name))
        }
    }

    async function clientAction(formData: FormData) {
        // Append checked permissions to the formData
        formData.delete("permissions") // Clear out any default form entries
        for (const perm of checkedPerms) {
            formData.append("permissions", perm)
        }

        const res = isEdit ? await updateRole(null, formData) : await createRole(null, formData)

        if (res?.error) {
            toast.error(res.error)
            if (res.issues) {
                res.issues.forEach((i) => {
                    toast.error(i.message)
                })
            }
        } else {
            toast.success(isEdit ? "Role updated successfully" : "Role created successfully")
            setOpen(false)
            if (!isEdit) {
                setCheckedPerms([])
            }
        }
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                {isEdit ? (
                    <Button variant="ghost" size="icon" className="hover:bg-muted cursor-pointer">
                        <Pencil className="h-4 w-4 text-muted-foreground" />
                    </Button>
                ) : (
                    <Button className="gap-2 cursor-pointer">
                        <PlusCircle className="h-4 w-4" />
                        Create Role
                    </Button>
                )}
            </DialogTrigger>
            <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
                <form action={clientAction}>
                    {isEdit && <input type="hidden" name="id" value={role.id} />}
                    <DialogHeader>
                        <DialogTitle>{isEdit ? "Edit Role" : "Create Dynamic Role"}</DialogTitle>
                        <DialogDescription>
                            Define role names, descriptions, and dynamic permission mappings.
                        </DialogDescription>
                    </DialogHeader>

                    <div className="grid gap-6 py-4">
                        <div className="grid gap-2">
                            <Label htmlFor="name">Role Name</Label>
                            <Input
                                id="name"
                                name="name"
                                defaultValue={role?.name || ""}
                                placeholder="e.g. Sales Supervisor"
                                required
                                disabled={role?.name === "Admin"}
                            />
                            {role?.name === "Admin" && (
                                <p className="text-xs text-muted-foreground italic">
                                    System Admin role name cannot be modified.
                                </p>
                            )}
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="description">Description</Label>
                            <Input
                                id="description"
                                name="description"
                                defaultValue={role?.description || ""}
                                placeholder="e.g. Can adjust inventory stock and view basic reports"
                            />
                        </div>

                        <div className="space-y-4">
                            <Label className="text-base font-semibold">Assign Permissions</Label>
                            <div className="space-y-4 rounded-md border p-4 bg-muted/10">
                                {permissionGroups.map((group) => {
                                    // Filter permissions list to only keep those available in DB and in this group
                                    const groupPermissions = allPermissions.filter((p) =>
                                        group.permissions.includes(p.name),
                                    )

                                    if (groupPermissions.length === 0) return null

                                    return (
                                        <div key={group.title} className="space-y-2">
                                            <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                                                {group.title}
                                            </h4>
                                            <div className="grid gap-3 sm:grid-cols-2">
                                                {groupPermissions.map((perm) => {
                                                    const isChecked = checkedPerms.includes(perm.name)
                                                    return (
                                                        <label
                                                            key={perm.id}
                                                            className="flex items-start gap-3 rounded-lg border p-3 hover:bg-muted/30 transition-colors cursor-pointer select-none"
                                                        >
                                                            <input
                                                                type="checkbox"
                                                                className="mt-1 h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary cursor-pointer"
                                                                checked={isChecked}
                                                                onChange={(e) =>
                                                                    handleCheckboxChange(perm.name, e.target.checked)
                                                                }
                                                            />
                                                            <div className="space-y-0.5">
                                                                <p className="text-sm font-medium leading-none">
                                                                    {perm.name}
                                                                </p>
                                                                <p className="text-xs text-muted-foreground">
                                                                    {perm.description || "No description"}
                                                                </p>
                                                            </div>
                                                        </label>
                                                    )
                                                })}
                                            </div>
                                        </div>
                                    )
                                })}
                            </div>
                        </div>
                    </div>

                    <DialogFooter>
                        <SubmitButton isEdit={isEdit} />
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    )
}
