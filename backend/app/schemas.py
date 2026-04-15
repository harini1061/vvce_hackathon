from pydantic import BaseModel
from datetime import datetime

class RegulationSourceOut(BaseModel):
    id: int
    name: str
    source_url: str
    jurisdiction: str
    fetch_type: str

    class Config:
        from_attributes = True

class ComplianceRuleOut(BaseModel):
    id: int
    rule_code: str
    title: str
    description: str
    condition_type: str
    threshold_value: float | None = None
    country_list: str | None = None
    requires_kyc: bool
    severity: str

    class Config:
        from_attributes = True

class TransactionOut(BaseModel):
    id: int
    sender_account: str
    receiver_account: str
    amount: float
    currency: str
    country: str
    kyc_verified: bool
    beneficiary_risk: str
    channel: str
    timestamp: datetime

    class Config:
        from_attributes = True

class AlertOut(BaseModel):
    id: int
    transaction_id: int
    score: float
    severity: str
    reason: str
    breached_rule_codes: str
    analyst_status: str

    class Config:
        from_attributes = True
