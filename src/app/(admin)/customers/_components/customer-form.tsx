"use client"

import { useRouter } from "next/navigation"
import { useState } from "react"
import { toast } from "sonner"
import { createCustomer, updateCustomer } from "@/actions/customer"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"

interface CustomerFormProps {
    initialData?: {
        id: string
        name: string
        email?: string | null
        phone?: string | null
        address?: string | null
    }
    onSuccess?: (customer: { id: string; name: string }) => void
    onCancel?: () => void
}

export function CustomerForm({ initialData, onSuccess, onCancel }: CustomerFormProps) {
    const router = useRouter()
    const [loading, setLoading] = useState(false)
    const [formData, setFormData] = useState({
        name: initialData?.name || "",
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
                email: formData.email || undefined,
                phone: formData.phone || undefined,
                address: formData.address || undefined,
            }

            let res: { error: string } | { success: boolean; data?: { id: string; name: string } }

            if (initialData) {
                res = await updateCustomer(initialData.id, data)
            } else {
                res = await createCustomer(data)
            }

            if ("error" in res) {
                toast.error(res.error)
            } else {
                toast.success(initialData ? "Customer updated" : "Customer created")
                if (onSuccess && res.data) {
                    onSuccess(res.data)
                } else if (!onSuccess) {
                    router.push("/customers")
                    router.refresh()
                }
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
                <Label htmlFor="name">Name</Label>
                <Input
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                    placeholder="Customer Name"
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
                        placeholder="customer@example.com"
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
                    placeholder="Residential or Shipping Address"
                />
            </div>

            <div className="flex justify-end gap-2">
                <Button variant="outline" type="button" onClick={() => (onCancel ? onCancel() : router.back())}>
                    Cancel
                </Button>
                <Button type="submit" disabled={loading}>
                    {loading ? "Saving..." : initialData ? "Update Customer" : "Create Customer"}
                </Button>
            </div>
        </form>
    )
}
