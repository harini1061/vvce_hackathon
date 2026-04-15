import asyncio
import json
from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from .database import Base, engine, SessionLocal
from .models import Transaction, Alert
from .routes import regulations, transactions, alerts, reports
from .services.transaction_simulator import generate_fake_transaction
from .services.rules_engine import evaluate_transaction
from .seed import seed_data
from .models import ComplianceRule

app = FastAPI(title="RegGuard AI")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

Base.metadata.create_all(bind=engine)

db = SessionLocal()
seed_data(db)
db.close()

app.include_router(regulations.router)
app.include_router(transactions.router)
app.include_router(alerts.router)
app.include_router(reports.router)

class ConnectionManager:
    def __init__(self):
        self.active_connections = []

    async def connect(self, websocket: WebSocket):
        await websocket.accept()
        self.active_connections.append(websocket)

    def disconnect(self, websocket: WebSocket):
        self.active_connections.remove(websocket)

    async def broadcast(self, message: dict):
        for connection in self.active_connections:
            await connection.send_text(json.dumps(message))

manager = ConnectionManager()

@app.get("/")
def root():
    return {"message": "RegGuard AI backend running"}

@app.websocket("/ws/live")
async def websocket_endpoint(websocket: WebSocket):
    await manager.connect(websocket)
    db: Session = SessionLocal()
    try:
        while True:
            tx_data = generate_fake_transaction()
            tx = Transaction(**tx_data)
            db.add(tx)
            db.commit()
            db.refresh(tx)

            rules = db.query(ComplianceRule).all()
            result = evaluate_transaction(tx, rules)

            alert = Alert(
                transaction_id=tx.id,
                score=result["score"],
                severity=result["severity"],
                reason=result["reason"],
                breached_rule_codes=result["breached_rule_codes"]
            )
            db.add(alert)
            db.commit()
            db.refresh(alert)

            await manager.broadcast({
                "transaction": {
                    "id": tx.id,
                    "sender_account": tx.sender_account,
                    "receiver_account": tx.receiver_account,
                    "amount": tx.amount,
                    "country": tx.country,
                    "kyc_verified": tx.kyc_verified,
                    "beneficiary_risk": tx.beneficiary_risk,
                    "channel": tx.channel
                },
                "alert": {
                    "id": alert.id,
                    "score": alert.score,
                    "severity": alert.severity,
                    "reason": alert.reason,
                    "breached_rule_codes": alert.breached_rule_codes,
                    "analyst_status": alert.analyst_status
                }
            })

            await asyncio.sleep(2)
    except WebSocketDisconnect:
        manager.disconnect(websocket)
        db.close()
