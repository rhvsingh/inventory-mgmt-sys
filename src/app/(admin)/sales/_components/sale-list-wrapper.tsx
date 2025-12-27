import { getTransactions } from "@/actions/transaction"
import { SaleList } from "./sale-list"

interface SaleListWrapperProps {
    page: number
    search?: string
}

export async function SaleListWrapper({ page, search }: SaleListWrapperProps) {
    const { data: sales, metadata } = await getTransactions("SALE", page, 50, search)

    return <SaleList sales={sales} metadata={metadata} />
}
