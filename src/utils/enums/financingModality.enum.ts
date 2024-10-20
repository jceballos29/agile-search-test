export enum FinancingModalityEnum {
    Subsidy = 1 << 0, // 0001
    Loan = 1 << 1, // 0010
    PartiallyRefundable = 1 << 2, // 0100
    Other = 1 << 3, // 1000
}