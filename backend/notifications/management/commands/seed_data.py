import json
from pathlib import Path
from django.core.management.base import BaseCommand
from notifications.models import Profile, Plan, PlanRequest, PlanMessage

class Command(BaseCommand):
    help = 'Seed the database from supabase_backup.json'

    def handle(self, *args, **options):
        # Look for supabase_backup.json in backend dir or parent dir
        backend_dir = Path(__file__).resolve().parent.parent.parent.parent
        backup_path = backend_dir / 'supabase_backup.json'
        if not backup_path.exists():
            backup_path = backend_dir.parent / 'supabase_backup.json'
        if not backup_path.exists():
            self.stderr.write(f"Backup file not found at {backup_path}")
            return

        with open(backup_path, 'r', encoding='utf-8') as f:
            data = json.load(f)

        # 1. Profiles
        profiles_created = 0
        for p in data.get('profiles', []):
            obj, created = Profile.objects.update_or_create(
                id=p['id'],
                defaults={
                    'phone': p.get('phone'),
                    'full_name': p.get('full_name'),
                    'username': p.get('username'),
                    'city': p.get('city') or 'Chennai',
                    'safety_contact_name': p.get('safety_contact_name'),
                    'safety_contact_phone': p.get('safety_contact_phone'),
                    'outings_attended': p.get('outings_attended', 0),
                    'outings_flaked': p.get('outings_flaked', 0),
                    'strike_count': p.get('strike_count', 0),
                    'fcm_token': p.get('fcm_token'),
                }
            )
            if created:
                profiles_created += 1

        self.stdout.write(f"Processed {len(data.get('profiles', []))} profiles ({profiles_created} created).")

        # 2. Plans
        plans_created = 0
        for p in data.get('plans', []):
            host = Profile.objects.filter(id=p['host_id']).first()
            if not host:
                continue
            obj, created = Plan.objects.update_or_create(
                id=p['id'],
                defaults={
                    'host': host,
                    'title': p['title'],
                    'category': p['category'],
                    'venue': p['venue'],
                    'area_neighborhood': p['area_neighborhood'],
                    'scheduled_time': p['scheduled_time'],
                    'slots_total': p.get('slots_total', 3),
                    'slots_claimed': p.get('slots_claimed', 1),
                    'split_vibe': p.get('split_vibe', 'Split equally'),
                    'notes': p.get('notes'),
                    'status': p.get('status', 'open'),
                }
            )
            if created:
                plans_created += 1

        self.stdout.write(f"Processed {len(data.get('plans', []))} plans ({plans_created} created).")

        # 3. Plan Requests
        requests_created = 0
        for r in data.get('plan_requests', []):
            plan = Plan.objects.filter(id=r['plan_id']).first()
            applicant = Profile.objects.filter(id=r['applicant_id']).first()
            if not plan or not applicant:
                continue
            obj, created = PlanRequest.objects.update_or_create(
                id=r['id'],
                defaults={
                    'plan': plan,
                    'applicant': applicant,
                    'pitch_message': r['pitch_message'],
                    'status': r.get('status', 'pending'),
                }
            )
            if created:
                requests_created += 1

        self.stdout.write(f"Processed {len(data.get('plan_requests', []))} requests ({requests_created} created).")
        self.stdout.write(self.style.SUCCESS("Database seeded successfully!"))
