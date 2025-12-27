import { redirect } from "next/navigation"
import { auth } from "@/auth"
import { ChangePasswordDialog } from "@/components/change-password-dialog"
import { NotificationSettings } from "@/components/notification-settings"
import { ProfileForm } from "@/components/profile-form"
import { ThemeSelector } from "@/components/theme-selector"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

export default async function SettingsPage() {
    const session = await auth()
    if (!session?.user) redirect("/login")

    const user = session.user
    const initials = user.name
        ?.split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2)

    return (
        <div className="flex flex-col gap-6 max-w-5xl mx-auto">
            <h1 className="text-3xl font-bold tracking-tight">Settings</h1>

            <div className="grid gap-6 md:grid-cols-3">
                {/* Main Profile Column */}
                <div className="md:col-span-2 space-y-6">
                    <Card>
                        <CardHeader className="flex flex-row items-center gap-4 space-y-0 pb-6 border-b">
                            <div className="h-16 w-16 rounded-full bg-primary/20 flex items-center justify-center text-2xl font-bold text-primary">
                                {initials}
                            </div>
                            <div className="flex-1">
                                <CardTitle className="text-xl">{user.name}</CardTitle>
                                <CardDescription>{user.email}</CardDescription>
                                <div className="mt-2 inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 border-transparent bg-secondary text-secondary-foreground hover:bg-secondary/80">
                                    {user.role}
                                </div>
                            </div>
                        </CardHeader>

                        <CardContent className="space-y-8 pt-6">
                            {/* Personal Info */}
                            <section>
                                <h3 className="text-lg font-medium mb-4">Personal Information</h3>
                                <ProfileForm user={user} />
                            </section>

                            <div className="border-t" />

                            {/* Security */}
                            <section className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                                <div className="space-y-1">
                                    <h3 className="text-lg font-medium">Password</h3>
                                    <p className="text-sm text-muted-foreground">Update your password securely.</p>
                                </div>
                                <ChangePasswordDialog userId={user.id || ""} userName={user.name || ""} />
                            </section>
                        </CardContent>
                    </Card>
                </div>

                {/* Sidebar Column (Appearance etc) */}
                <div className="space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>Appearance</CardTitle>
                            <CardDescription>Customize the look and feel.</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <ThemeSelector />
                        </CardContent>
                    </Card>

                    {(user.role === "ADMIN" || user.role === "MANAGER") && (
                        <Card>
                            <CardHeader>
                                <CardTitle>Notifications</CardTitle>
                                <CardDescription>Customize the notifications polling interval.</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <NotificationSettings />
                            </CardContent>
                        </Card>
                    )}
                </div>
            </div>
        </div>
    )
}
