from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from ..database import get_db
from ..models import Alert

router = APIRouter(prefix="/alerts", tags=["Alerts"])

@router.get("/")
def get_alerts(db: Session = Depends(get_db)):
    return db.query(Alert).order_by(Alert.id.desc()).limit(50).all()

@router.post("/{alert_id}/status/{status}")
def update_alert_status(alert_id: int, status: str, db: Session = Depends(get_db)):
    alert = db.query(Alert).filter(Alert.id == alert_id).first()
    if not alert:
        return {"error": "Alert not found"}
    alert.analyst_status = status
    db.commit()
    db.refresh(alert)
    return alert
