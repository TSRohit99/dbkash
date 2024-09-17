import { TokenType } from "./TokenInfo";

export type TransactionType = 'send' | 'receive' | 'pay';

export interface Transaction {
  id: string;
  type: TransactionType;
  amount: string;
  tokenType: TokenType;
  from: string;
  to: string;
  date: string;
  time: string;
  gasFee: string;
}