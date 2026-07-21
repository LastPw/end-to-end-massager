from fastapi import FastAPI
from fastapi.responses import HTMLResponse

app = FastAPI()


@app.get("/", response_class=HTMLResponse)
def home() -> HTMLResponse:
    return HTMLResponse(
        """
        <html>
          <head>
            <title>Upstream App</title>
          </head>
          <body>
            <h1>Protected App</h1>
            <p>This traffic is routed through the smart security gateway.</p>
          </body>
        </html>
        """
    )
