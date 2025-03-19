export type Payment = {
  id: string
  amount: number
  cuil: string
  email: string
}

interface Document {
  headers?: string[];
  rows?: string[];
  $id: string;
  $collectionId: string;
  $databaseId: string;
  $createdAt: string;
  $updatedAt: string;
  $permissions: string[];
}

interface DataRecordsContextType {
  total: number;
  documents: Document[];

}

export interface RecordsContextType {
  data: DataRecordsContextType,
  isPending: boolean
}