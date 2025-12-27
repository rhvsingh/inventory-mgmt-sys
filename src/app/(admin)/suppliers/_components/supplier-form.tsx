"use client"

import { useRouter } from "next/navigation"
import { useState } from "react"
import { toast } from "sonner"
import { createSupplier, updateSupplier } from "@/actions/supplier"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"

interface SupplierFormProps {
    initialData?: {
        id: string
        name: string
        contactPerson?: string | null
        email?: string | null
        phone?: string | null
        address?: string | null
    }
}

export function SupplierForm({ initialData }: SupplierFormProps) {
    const router = useRouter()
    const [loading, setLoading] = useState(false)
    const [formData, setFormData] = useState({
        name: initialData?.name || "",
        contactPerson: initialData?.contactPerson || "",
        email: initialData?.email || "",
        phone: initialData?.phone || "",
        address: initialData?.address || "",
    })

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value })
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)

        try {
            const data = {
                name: formData.name,
                contactPerson: formData.contactPerson || undefined,
                email: formData.email || undefined,
                phone: formData.phone || undefined,
                address: formData.address || undefined,
            }

            let res: { error: string } | { success: boolean }
            if (initialData) {
                res = await updateSupplier(initialData.id, data)
            } else {
                res = await createSupplier(data)
            }

            if ("error" in res) {
                toast.error(res.error)
            } else {
                toast.success(initialData ? "Supplier updated" : "Supplier created")
                router.push("/suppliers")
                router.refresh()
            }
        } catch {
            toast.error("Something went wrong")
        } finally {
            setLoading(false)
        }
    }

    return (
        <form onSubmit={handleSubmit} className="space-y-4 max-w-lg">
            <div className="space-y-2">
                <Label htmlFor="name">Company Name</Label>
                <Input
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                    placeholder="Supplier Company Name"
                />
            </div>

            <div className="space-y-2">
                <Label htmlFor="contactPerson">Contact Person</Label>
                <Input
                    id="contactPerson"
                    name="contactPerson"
                    value={formData.contactPerson}
                    onChange={handleChange}
                    placeholder="John Doe"
                />
            </div>

            <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                        id="email"
                        name="email"
                        type="email"
                        value={formData.email}
                        onChange={handleChange}
                        placeholder="supplier@example.com"
                    />
                </div>
                <div className="space-y-2">
                    <Label htmlFor="phone">Phone</Label>
                    <Input
                        id="phone"
                        name="phone"
                        value={formData.phone}
                        onChange={handleChange}
                        placeholder="+1 234 567 890"
                    />
                </div>
            </div>

            <div className="space-y-2">
                <Label htmlFor="address">Address</Label>
                <Textarea
                    id="address"
                    name="address"
                    value={formData.address}
                    onChange={handleChange}
                    placeholder="Business Address"
                />
            </div>

            <div className="flex justify-end gap-2">
                <Button variant="outline" type="button" onClick={() => router.back()}>
                    Cancel
                </Button>
                <Button type="submit" disabled={loading}>
                    {loading ? "Saving..." : initialData ? "Update Supplier" : "Create Supplier"}
                </Button>
            </div>
        </form>
    )
}
