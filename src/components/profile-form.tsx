"use client"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { updateProfile } from "@/actions/user"
import { useFormStatus } from "react-dom"
import { toast } from "sonner"
import type { User } from "next-auth"

function SubmitButton() {
    const { pending } = useFormStatus()
    return (
        <Button type="submit" disabled={pending} className="cursor-pointer">
            {pending ? "Saving..." : "Save Changes"}
        </Button>
    )
}

export function ProfileForm({ user }: { user: User }) {
    async function clientAction(formData: FormData) {
        const res = await updateProfile(null, formData)
        if (res?.error) {
            toast.error(res.error)
        } else {
            toast.success("Profile updated")
        }
    }

    return (
        <form action={clientAction} className="space-y-4">
            <input type="hidden" name="id" value={user.id} />
            <div className="space-y-2">
                <Label htmlFor="name">Name</Label>
                <Input id="name" name="name" defaultValue={user.name || ""} required />
            </div>
            <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input id="email" name="email" type="email" defaultValue={user.email || ""} required />
            </div>
            <div className="space-y-2">
                <Label htmlFor="role">Role</Label>
                <Input id="role" value={user.role || ""} disabled className="bg-muted" />
                <p className="text-[0.8rem] text-muted-foreground">Role cannot be changed.</p>
            </div>
            <div className="pt-2">
                <SubmitButton />
            </div>
        </form>
    )
}
