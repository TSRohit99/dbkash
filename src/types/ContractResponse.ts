export interface ContractResponse {
  success: boolean;
  transactionHash?: string;
  approvalHash?: string;
  signerAddress?: string;
  fromToken?: string;
  amount?: number | string;
}
