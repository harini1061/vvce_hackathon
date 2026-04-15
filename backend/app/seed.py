from .models import RegulationSource, ComplianceRule

def seed_data(db):
    if db.query(RegulationSource).count() == 0:
        db.add_all([
            RegulationSource(name="RBI", source_url="https://www.rbi.org.in/Scripts/NotificationUser.aspx", jurisdiction="India", fetch_type="html"),
            RegulationSource(name="SEBI", source_url="https://www.sebi.gov.in/sebiweb/home/HomeAction.do?doListing=yes&sid=1&ssid=7&smid=0", jurisdiction="India", fetch_type="html"),
            RegulationSource(name="GDPR", source_url="https://advisera.com/gdpr/", jurisdiction="EU", fetch_type="html"),
        ])
        db.commit()

    if db.query(ComplianceRule).count() == 0:
        db.add_all([
            ComplianceRule(
                source_id=1,
                rule_code="AML-4.2",
                title="Large transfer without KYC",
                description="Flag transactions above threshold when KYC is incomplete.",
                condition_type="threshold_kyc",
                threshold_value=50000,
                requires_kyc=True,
                severity="high"
            ),
            ComplianceRule(
                source_id=1,
                rule_code="AML-7.1",
                title="High-risk geography exposure",
                description="Flag transfers involving high-risk countries.",
                condition_type="high_risk_country",
                country_list="IR,RU",
                severity="high"
            ),
            ComplianceRule(
                source_id=2,
                rule_code="RISK-2.4",
                title="High-risk beneficiary",
                description="Flag transactions sent to high-risk beneficiaries.",
                condition_type="high_risk_beneficiary",
                severity="medium"
            ),
        ])
        db.commit()
