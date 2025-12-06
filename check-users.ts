import { PrismaClient } from "@prisma/client"
import bcrypt from "bcryptjs"

const prisma = new PrismaClient()

async function main() {
    const users = await prisma.user.findMany()
    console.log("Users in DB:", users)

    if (users.length > 0) {
        const match = await bcrypt.compare("password123", users[0].password)
        console.log("Does 'password123' match first user?", match)
    }
}

main()
    .then(async () => {
        await prisma.$disconnect()
    })
    .catch(async (e) => {
        console.error(e)
        await prisma.$disconnect()
        process.exit(1)
    })
