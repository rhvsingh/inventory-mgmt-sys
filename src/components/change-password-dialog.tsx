"use client"

import { KeyRound } from "lucide-react"
import { useState } from "react"
import { toast } from "sonner"
import { updatePassword } from "@/actions/user-settings"
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

interface ChangePasswordDialogProps {
    userId: string
    userName: string
    isAdminReset?: boolean // true if Admin is resetting another user's password
}

export function ChangePasswordDialog({ userId, userName, isAdminReset = false }: ChangePasswordDialogProps) {
    const [open, setOpen] = useState(false)
    const [currentPassword, setCurrentPassword] = useState("")
    const [newPassword, setNewPassword] = useState("")
    const [loading, setLoading] = useState(false)

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)

        const res = await updatePassword({
            userId,
            newPassword,
            currentPassword: isAdminReset ? undefined : currentPassword,
        })

        setLoading(false)

        if (res?.error) {
            toast.error(res.error)
        } else {
            toast.success("Password updated successfully")
            setOpen(false)
            setCurrentPassword("")
            setNewPassword("")
        }
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                {isAdminReset ? (
                    <Button variant="ghost" size="sm" className="w-full justify-start cursor-pointer">
                        <KeyRound className="mr-2 h-4 w-4" />
                        Reset Password
                    </Button>
                ) : (
                    <Button variant="outline">Change Password</Button>
                )}
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
                <form onSubmit={handleSubmit}>
                    <DialogHeader>
                        <DialogTitle>{isAdminReset ? `Reset Password for ${userName}` : "Change Password"}</DialogTitle>
                        <DialogDescription>
                            {isAdminReset
                                ? "Enter a new password for this user."
                                : "Enter your current password and a new one."}
                        </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                        {!isAdminReset && (
                            <div className="grid grid-cols-4 items-center gap-4">
                                <Label htmlFor="current-password" className="text-right">
                                    Current
                                </Label>
                                <Input
                                    id="current-password"
                                    type="password"
                                    className="col-span-3"
                                    value={currentPassword}
                                    onChange={(e) => setCurrentPassword(e.target.value)}
                                    required
                                />
                            </div>
                        )}
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="new-password" className="text-right">
                                New
                            </Label>
                            <Input
                                id="new-password"
                                type="password"
                                className="col-span-3"
                                value={newPassword}
                                onChange={(e) => setNewPassword(e.target.value)}
                                required
                                minLength={6}
                            />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button type="submit" disabled={loading}>
                            {loading ? "Updating..." : "Update Password"}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    )
}
