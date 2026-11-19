from datetime import datetime, timedelta, timezone
from django.core.management.base import BaseCommand
from django.conf import settings
import requests
from notifications.fcm_service import notify_outing_countdown
from notifications.supabase_client import get_squad_fcm_tokens

class Command(BaseCommand):
    help = 'Check for outings scheduled in ~2 hours and send push countdowns to squad members.'

    def handle(self, *args, **options):
        now = datetime.now(timezone.utc)
        start_window = (now + timedelta(hours=1, minutes=45)).strftime('%Y-%m-%dT%H:%M:%SZ')
        end_window = (now + timedelta(hours=2, minutes=15)).strftime('%Y-%m-%dT%H:%M:%SZ')

        headers = {
            'apikey': settings.SUPABASE_ANON_KEY,
            'Authorization': f'Bearer {settings.SUPABASE_ANON_KEY}',
        }

        url = (
            f"{settings.SUPABASE_URL}/rest/v1/plans?"
            f"scheduled_time=gte.{start_window}&scheduled_time=lte.{end_window}&select=id,title,scheduled_time"
        )

        res = requests.get(url, headers=headers, timeout=5)
        if res.status_code != 200:
            self.stderr.write(f"Failed to query Supabase: {res.text}")
            return

        plans = res.json()
        self.stdout.write(f"Found {len(plans)} plans in 2-hour countdown window.")

        for plan in plans:
            plan_id = plan['id']
            title = plan['title']
            tokens = get_squad_fcm_tokens(plan_id)
            if tokens:
                self.stdout.write(f"Notifying {len(tokens)} members for '{title}'...")
                notify_outing_countdown(tokens, title, hours_left=2, plan_id=plan_id)
            else:
                self.stdout.write(f"No tokens found for squad '{title}'.")
