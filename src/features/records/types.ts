import { Models } from "node-appwrite"

export type Payment = {
  id: string
  amount: number
  cuil: string
  email: string
}

export interface RecordsContextType {
  data: Models.DocumentList<Models.Document>,
  isPending: boolean
}