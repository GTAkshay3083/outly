from django.core.management.base import BaseCommand
from notifications.models import Profile
from notifications.fcm_service import get_firebase_app, send_push_notification

class Command(BaseCommand):
    help = 'Test Firebase Cloud Messaging (FCM) credentials and send a test push'

    def add_arguments(self, parser):
        parser.add_argument('--token', type=str, help='Specific FCM device token to send to')

    def handle(self, *args, **options):
        self.stdout.write("Checking Firebase Admin initialization...")
        app = get_firebase_app()

        if not app:
            self.stdout.write(
                self.style.WARNING(
                    "Firebase Admin is currently running in MOCK mode.\n"
                    "To enable real notifications, place 'firebase-service-account.json' inside the 'backend/' folder."
                )
            )
        else:
            self.stdout.write(self.style.SUCCESS("✓ Firebase Admin credentials loaded successfully!"))

        token = options.get('token')
        if not token:
            # Look for any profile with an FCM token
            profile_with_token = Profile.objects.exclude(fcm_token__isnull=True).exclude(fcm_token='').first()
            if profile_with_token:
                token = profile_with_token.fcm_token
                self.stdout.write(f"Using registered token from user @{profile_with_token.username}")
            else:
                token = "test-mock-device-token-12345"
                self.stdout.write("No device tokens registered yet in database; using sample token.")

        self.stdout.write(f"Sending test notification to token: {token[:20]}...")
        result = send_push_notification(
            token=token,
            title="Outly Test Push ⚡",
            body="Your anti-flake notifications are working perfectly!",
            data={'type': 'test_ping'}
        )

        self.stdout.write(f"Result: {result}")
