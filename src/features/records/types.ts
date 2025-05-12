import { Models } from "node-appwrite"

export interface RecordsContextType {
  data: Models.DocumentList<Models.Document>,
  isPending: boolean
}

export type Record = Models.Document & {
  data: string[],
  tableId: string,
  teamId: string,
  createdBy: string,
}