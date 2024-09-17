import { Transaction } from "./TxnHistoryTypes";

export interface UtilFuncsResponse {
    success: boolean;
    token?: string | null;
    address?: string | null;
    error?: string;
    txnHash?: string;
    txns?: Array<Transaction>;
  }