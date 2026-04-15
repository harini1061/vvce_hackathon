from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from ..database import get_db
from ..models import Transaction

router = APIRouter(prefix="/transactions", tags=["Transactions"])

@router.get("/")
def get_transactions(db: Session = Depends(get_db)):
    return db.query(Transaction).order_by(Transaction.id.desc()).limit(50).all()
