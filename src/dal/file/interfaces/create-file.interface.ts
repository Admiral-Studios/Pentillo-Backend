export interface CreateFileInterface {
  name: string;
  userId: string;
  size: number;
  mimeType: string;
  key: string;
  fullPath: string;
  note?: string;
  type: string;
  transactionId?: string;
  listId: string;
}
