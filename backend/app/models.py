from sqlalchemy import Column, Integer, String, Float, Boolean, DateTime, Text, ForeignKey
from sqlalchemy.orm import relationship
from datetime import datetime
from .database import Base

class RegulationSource(Base):
    __tablename__ = "regulation_sources"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, unique=True, nullable=False)
    source_url = Column(String, nullable=False)
    jurisdiction = Column(String, nullable=False)
    fetch_type = Column(String, default="html")
    last_synced_at = Column(DateTime, default=datetime.utcnow)

class ComplianceRule(Base):
    __tablename__ = "compliance_rules"

    id = Column(Integer, primary_key=True, index=True)
    source_id = Column(Integer, ForeignKey("regulation_sources.id"))
    rule_code = Column(String, nullable=False)
    title = Column(String, nullable=False)
    description = Column(Text, nullable=False)
    condition_type = Column(String, nullable=False)
    threshold_value = Column(Float, nullable=True)
    country_list = Column(String, nullable=True)
    requires_kyc = Column(Boolean, default=False)
    severity = Column(String, default="medium")

class Transaction(Base):
    __tablename__ = "transactions"

    id = Column(Integer, primary_key=True, index=True)
    timestamp = Column(DateTime, default=datetime.utcnow)
    sender_account = Column(String, nullable=False)
    receiver_account = Column(String, nullable=False)
    amount = Column(Float, nullable=False)
    currency = Column(String, default="INR")
    country = Column(String, nullable=False)
    kyc_verified = Column(Boolean, default=True)
    beneficiary_risk = Column(String, default="low")
    channel = Column(String, default="NEFT")

class Alert(Base):
    __tablename__ = "alerts"

    id = Column(Integer, primary_key=True, index=True)
    transaction_id = Column(Integer, ForeignKey("transactions.id"))
    score = Column(Float, nullable=False)
    severity = Column(String, nullable=False)
    reason = Column(Text, nullable=False)
    breached_rule_codes = Column(String, nullable=False)
    analyst_status = Column(String, default="open")
