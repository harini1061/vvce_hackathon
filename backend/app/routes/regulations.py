from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from ..database import get_db
from ..models import RegulationSource, ComplianceRule
from ..services.regulation_fetcher import fetch_regulation_summary

router = APIRouter(prefix="/regulations", tags=["Regulations"])

@router.get("/sources")
def get_sources(db: Session = Depends(get_db)):
    return db.query(RegulationSource).all()

@router.get("/fetch/{source_name}")
def fetch_source(source_name: str):
    return fetch_regulation_summary(source_name)

@router.get("/rules")
def get_rules(db: Session = Depends(get_db)):
    return db.query(ComplianceRule).all()
