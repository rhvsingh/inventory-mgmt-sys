import { getTransactions } from "@/actions/transaction"
import { SaleList } from "./sale-list"

interface SaleListWrapperProps {
    page: number
}

export async function SaleListWrapper({ page }: SaleListWrapperProps) {
    const { data: sales, metadata } = await getTransactions("SALE", page)

    return <SaleList sales={sales} metadata={metadata} />
}
