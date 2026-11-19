from django.contrib import admin
from django.urls import path, include
from django.http import HttpResponse

def home_view(request):
    html = """
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <title>Outly Backend API</title>
        <style>
            body {
                background-color: #08080A;
                color: #F5F5F7;
                font-family: system-ui, -apple-system, sans-serif;
                display: flex;
                align-items: center;
                justify-content: center;
                min-height: 100vh;
                margin: 0;
            }
            .card {
                background: #121214;
                border: 1px solid #2A2A2E;
                border-radius: 24px;
                padding: 32px;
                max-width: 440px;
                width: 100%;
                box-shadow: 0 20px 40px rgba(0,0,0,0.5);
                text-align: center;
            }
            .badge {
                display: inline-block;
                background: rgba(29, 185, 84, 0.15);
                border: 1px solid rgba(29, 185, 84, 0.3);
                color: #1DB954;
                padding: 4px 12px;
                border-radius: 999px;
                font-size: 11px;
                font-weight: 700;
                text-transform: uppercase;
                letter-spacing: 1px;
                margin-bottom: 12px;
            }
            h1 {
                margin: 0 0 8px 0;
                font-size: 26px;
                font-weight: 800;
            }
            p {
                color: #A1A1A6;
                font-size: 13px;
                margin-bottom: 24px;
                line-height: 1.5;
            }
            .links {
                display: flex;
                flex-direction: column;
                gap: 10px;
            }
            a {
                display: block;
                padding: 12px 16px;
                border-radius: 14px;
                text-decoration: none;
                font-weight: 600;
                font-size: 13px;
                transition: all 0.15s ease;
            }
            .primary {
                background: #FF5E3A;
                color: white;
            }
            .primary:hover {
                background: #ff7252;
            }
            .secondary {
                background: #1C1C1F;
                color: #F5F5F7;
                border: 1px solid #2A2A2E;
            }
            .secondary:hover {
                border-color: #3E3E42;
                background: #252529;
            }
        </style>
    </head>
    <body>
        <div class="card">
            <div class="badge">● Server Active</div>
            <h1>Outly Backend API</h1>
            <p>Your Django + FCM backend is running smoothly. Use the links below to access the Admin Panel or open the App UI.</p>
            <div class="links">
                <a href="http://localhost:5173" class="primary" target="_blank">📱 Open Outly App UI (Port 5173)</a>
                <a href="/admin/" class="secondary">⚙️ Django Admin Dashboard</a>
                <a href="/api/plans/" class="secondary" target="_blank">📡 View Plans API (/api/plans/)</a>
            </div>
        </div>
    </body>
    </html>
    """
    return HttpResponse(html)

urlpatterns = [
    path('', home_view, name='home'),
    path('admin/', admin.site.urls),
    path('api/', include('notifications.urls')),
]
