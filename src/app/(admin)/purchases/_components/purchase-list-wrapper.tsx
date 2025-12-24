import { getTransactions } from "@/actions/transaction"
import { PurchaseList } from "./purchase-list"

interface PurchaseListWrapperProps {
    page: number
}

export async function PurchaseListWrapper({ page }: PurchaseListWrapperProps) {
    const { data: purchases, metadata } = await getTransactions("PURCHASE", page)

    return <PurchaseList purchases={purchases} metadata={metadata} />
}
