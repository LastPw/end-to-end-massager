import io
import time
from typing import List, Dict

from reportlab.lib.pagesizes import A4
from reportlab.lib.units import mm
from reportlab.pdfgen import canvas


def build_hourly_pdf(reports: List[Dict[str, object]], title: str) -> bytes:
    buffer = io.BytesIO()
    c = canvas.Canvas(buffer, pagesize=A4)
    width, height = A4
    y = height - 20 * mm

    c.setFont("Helvetica-Bold", 14)
    c.drawString(20 * mm, y, title)
    y -= 10 * mm

    c.setFont("Helvetica", 10)
    c.drawString(20 * mm, y, f"Generated at: {time.strftime('%Y-%m-%d %H:%M:%S')}")
    y -= 10 * mm

    headers = ["Time", "Type", "IP", "Path", "UA", "Detail"]
    c.setFont("Helvetica-Bold", 9)
    c.drawString(20 * mm, y, " | ".join(headers))
    y -= 6 * mm
    c.setFont("Helvetica", 8)

    for item in reports:
        ts = time.strftime("%H:%M:%S", time.localtime(int(item["ts_ms"]) / 1000))
        line = f"{ts} | {item['report_type']} | {item['client_ip']} | {item['path']} | {str(item['user_agent'])[:30]} | {item['detail']}"
        c.drawString(20 * mm, y, line)
        y -= 5 * mm
        if y < 20 * mm:
            c.showPage()
            y = height - 20 * mm
            c.setFont("Helvetica", 8)

    c.showPage()
    c.save()
    return buffer.getvalue()
