from datetime import datetime

def generate_audit_entry(alert, transaction):
    return {
        "generated_at": datetime.utcnow().isoformat(),
        "transaction_id": transaction.id,
        "alert_id": alert.id,
        "severity": alert.severity,
        "reason": alert.reason,
        "breached_rules": alert.breached_rule_codes,
        "recommended_action": "Escalate for analyst review" if alert.severity != "green" else "Archive"
    }
