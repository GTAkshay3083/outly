import requests
from django.conf import settings

def _headers():
    return {
        'apikey': settings.SUPABASE_ANON_KEY,
        'Authorization': f'Bearer {settings.SUPABASE_ANON_KEY}',
        'Content-Type': 'application/json',
    }

def get_profile(user_id: str):
    """Fetch user profile including full_name and fcm_token from Supabase."""
    url = f"{settings.SUPABASE_URL}/rest/v1/profiles?id=eq.{user_id}&select=*"
    res = requests.get(url, headers=_headers(), timeout=5)
    if res.status_code == 200 and res.json():
        return res.json()[0]
    return None

def get_plan(plan_id: str):
    """Fetch plan details from Supabase."""
    url = f"{settings.SUPABASE_URL}/rest/v1/plans?id=eq.{plan_id}&select=*"
    res = requests.get(url, headers=_headers(), timeout=5)
    if res.status_code == 200 and res.json():
        return res.json()[0]
    return None

def get_squad_fcm_tokens(plan_id: str, exclude_user_id: str = None):
    """
    Fetch all FCM tokens belonging to confirmed members of a squad
    (Host + Accepted applicants), optionally excluding the sender.
    """
    tokens = []

    # 1. Fetch the plan to get the host_id
    plan = get_plan(plan_id)
    if plan and plan.get('host_id') != exclude_user_id:
        host_profile = get_profile(plan['host_id'])
        if host_profile and host_profile.get('fcm_token'):
            tokens.append(host_profile['fcm_token'])

    # 2. Fetch accepted applicants
    url = f"{settings.SUPABASE_URL}/rest/v1/plan_requests?plan_id=eq.{plan_id}&status=eq.accepted&select=applicant_id"
    res = requests.get(url, headers=_headers(), timeout=5)
    if res.status_code == 200:
        for req in res.json():
            applicant_id = req.get('applicant_id')
            if applicant_id and applicant_id != exclude_user_id:
                prof = get_profile(applicant_id)
                if prof and prof.get('fcm_token'):
                    tokens.append(prof['fcm_token'])

    # Remove duplicates
    return list(set(tokens))
