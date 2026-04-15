from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from ..database import get_db
from ..models import Alert, Transaction
from ..services.audit_service import generate_audit_entry

router = APIRouter(prefix="/reports", tags=["Reports"])

@router.get("/audit")
def get_audit_report(db: Session = Depends(get_db)):
    alerts = db.query(Alert).all()
    report = []
    for alert in alerts:
        tx = db.query(Transaction).filter(Transaction.id == alert.transaction_id).first()
        if tx:
            report.append(generate_audit_entry(alert, tx))
    return report
