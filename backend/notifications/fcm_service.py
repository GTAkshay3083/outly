import os
import logging
from django.conf import settings
import firebase_admin
from firebase_admin import credentials, messaging

logger = logging.getLogger(__name__)

_firebase_app = None

def get_firebase_app():
    """Initialize or return the Firebase Admin app instance."""
    global _firebase_app
    if _firebase_app:
        return _firebase_app

    # 1. Check environment variable JSON string (for cloud deployments like Render/Railway)
    cred_json_str = os.environ.get('FIREBASE_CREDENTIALS_JSON')
    if cred_json_str:
        try:
            import json
            cred_dict = json.loads(cred_json_str)
            cred = credentials.Certificate(cred_dict)
            _firebase_app = firebase_admin.initialize_app(cred)
            logger.info("Firebase Admin initialized successfully from FIREBASE_CREDENTIALS_JSON env var")
            return _firebase_app
        except Exception as e:
            logger.error("Error initializing Firebase Admin from env var: %s", e)

    # 2. Check local file path
    cred_path = getattr(settings, 'FIREBASE_CREDENTIALS_PATH', None)
    if cred_path and os.path.exists(cred_path):
        try:
            cred = credentials.Certificate(cred_path)
            _firebase_app = firebase_admin.initialize_app(cred)
            logger.info("Firebase Admin initialized successfully with %s", cred_path)
            return _firebase_app
        except Exception as e:
            logger.error("Error initializing Firebase Admin: %s", e)
    else:
        logger.warning(
            "Firebase credentials not found at %s. Push notifications will run in MOCK mode.",
            cred_path
        )
    return None

def send_push_notification(token: str, title: str, body: str, data: dict = None):
    """Send a push notification to a single device FCM token."""
    if not token:
        logger.warning("send_push_notification skipped: token is empty.")
        return {'status': 'skipped', 'reason': 'no_token'}

    app = get_firebase_app()
    if not app:
        logger.info("[MOCK PUSH] -> Token: %s | Title: %s | Body: %s | Data: %s", token, title, body, data)
        return {'status': 'mocked', 'token': token, 'title': title, 'body': body}

    string_data = {str(k): str(v) for k, v in (data or {}).items()}

    message = messaging.Message(
        notification=messaging.Notification(title=title, body=body),
        data=string_data,
        token=token,
    )

    try:
        response = messaging.send(message)
        logger.info("Successfully sent message: %s", response)
        return {'status': 'success', 'message_id': response}
    except Exception as e:
        logger.error("Failed to send FCM message: %s", e)
        return {'status': 'error', 'error': str(e)}

def send_multicast_push(tokens: list[str], title: str, body: str, data: dict = None):
    """Send a push notification to multiple device tokens simultaneously."""
    valid_tokens = [t for t in tokens if t]
    if not valid_tokens:
        return {'status': 'skipped', 'reason': 'no_valid_tokens'}

    app = get_firebase_app()
    if not app:
        logger.info("[MOCK MULTICAST PUSH] -> %d tokens | Title: %s | Body: %s", len(valid_tokens), title, body)
        return {'status': 'mocked', 'token_count': len(valid_tokens)}

    string_data = {str(k): str(v) for k, v in (data or {}).items()}

    message = messaging.MulticastMessage(
        notification=messaging.Notification(title=title, body=body),
        data=string_data,
        tokens=valid_tokens,
    )

    try:
        batch_response = messaging.send_each_for_multicast(message)
        logger.info("Successfully sent multicast: %d successes, %d failures",
                    batch_response.success_count, batch_response.failure_count)
        return {
            'status': 'success',
            'success_count': batch_response.success_count,
            'failure_count': batch_response.failure_count,
        }
    except Exception as e:
        logger.error("Failed to send multicast message: %s", e)
        return {'status': 'error', 'error': str(e)}

# --- Domain Triggers ---

def notify_request_accepted(fcm_token: str, plan_title: str, plan_id: str):
    return send_push_notification(
        token=fcm_token,
        title="You're in the Squad! 🚀",
        body=f"Your pitch for '{plan_title}' was accepted! Ephemeral squad chat is now unlocked.",
        data={'type': 'request_accepted', 'planId': plan_id}
    )

def notify_new_join_request(host_token: str, applicant_name: str, plan_title: str, pitch_message: str, plan_id: str):
    return send_push_notification(
        token=host_token,
        title="New Join Request 🎯",
        body=f"{applicant_name} pitched for '{plan_title}': \"{pitch_message}\"",
        data={'type': 'new_request', 'planId': plan_id}
    )

def notify_squad_message(tokens: list[str], sender_name: str, message_content: str, plan_title: str, plan_id: str):
    snippet = message_content[:80] + ('...' if len(message_content) > 80 else '')
    return send_multicast_push(
        tokens=tokens,
        title=f"{plan_title} • {sender_name}",
        body=snippet,
        data={'type': 'new_message', 'planId': plan_id}
    )

def notify_outing_countdown(tokens: list[str], plan_title: str, hours_left: int, plan_id: str):
    return send_multicast_push(
        tokens=tokens,
        title=f"Outing in {hours_left} Hours! ⏰",
        body=f"Your squad for '{plan_title}' is gearing up. Check the chat for final meeting coordinates.",
        data={'type': 'countdown', 'planId': plan_id}
    )
