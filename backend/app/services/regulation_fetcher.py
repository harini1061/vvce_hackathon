import requests
from bs4 import BeautifulSoup

REG_SOURCES = {
    "RBI": "https://www.rbi.org.in/Scripts/NotificationUser.aspx",
    "SEBI": "https://www.sebi.gov.in/sebiweb/home/HomeAction.do?doListing=yes&sid=1&ssid=7&smid=0",
    "GDPR": "https://advisera.com/gdpr/"
}

def fetch_regulation_summary(source_name: str):
    url = REG_SOURCES.get(source_name)
    if not url:
        return {"source": source_name, "content": "Unknown source", "url": ""}

    try:
        response = requests.get(url, timeout=15)
        soup = BeautifulSoup(response.text, "html.parser")
        text = " ".join(soup.get_text(separator=" ").split())[:2500]
        return {"source": source_name, "content": text, "url": url}
    except Exception as e:
        return {"source": source_name, "content": f"Fetch failed: {str(e)}", "url": url}
