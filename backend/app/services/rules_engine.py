def evaluate_transaction(transaction, rules):
    score = 0
    reasons = []
    breached = []

    for rule in rules:
        if rule.condition_type == "threshold_kyc":
            if transaction.amount > (rule.threshold_value or 0) and not transaction.kyc_verified:
                score += 40
                reasons.append(f"{rule.title}: amount above threshold without KYC.")
                breached.append(rule.rule_code)

        if rule.condition_type == "high_risk_country":
            countries = (rule.country_list or "").split(",")
            if transaction.country in [c.strip() for c in countries]:
                score += 30
                reasons.append(f"{rule.title}: transfer involves high-risk geography.")
                breached.append(rule.rule_code)

        if rule.condition_type == "high_risk_beneficiary":
            if transaction.beneficiary_risk == "high":
                score += 20
                reasons.append(f"{rule.title}: beneficiary risk is high.")
                breached.append(rule.rule_code)

    severity = "green"
    if score >= 60:
        severity = "red"
    elif score >= 30:
        severity = "amber"

    return {
        "score": score,
        "severity": severity,
        "reason": " ".join(reasons) if reasons else "No material compliance issue detected.",
        "breached_rule_codes": ",".join(sorted(set(breached))) if breached else "NONE"
    }
