import os
import time
import random
import requests
import concurrent.futures
import pandas as pd
from bs4 import BeautifulSoup
from jobspy import scrape_jobs
from supabase import create_client, Client
from datetime import datetime

# 🔑 LIVE SUPABASE CREDENTIALS ENCRYPTED MATRIX
SUPABASE_URL = "https://vtzbrgcwhvicqpuwlxxc.supabase.co"
SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZ0emJyZ2N3aHZpY3FwdXdseHhjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODA3OTgwNjksImV4cCI6MjA5NjM3NDA2OX0.vkwTuZwGQY4dTM0Jp6hwGNPL6o9JetWagP0sQseyECU"

supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)

SEARCH_KEYWORDS = [
    # --- Software & Core Tech Track ---
    "Software Engineer Intern",
    "Frontend Developer Intern",
    "Backend Developer Intern",
    "Full Stack Intern",
    "Web Development Intern",
    "Mobile App Intern",
    "DevOps Intern",
    "Cybersecurity Intern",
    
    # --- AI, Data, & Systems Track ---
    "Data Science Intern",
    "Data Analyst Intern",
    "Machine Learning Intern",
    "AI Intern",
    "Cloud Engineer Intern",
    
    # --- UI/UX & Creative Design Track ---
    "UX UI Design Intern",
    "Product Design Intern",
    "Graphic Design Intern",
    "Web Design Intern",
    
    # --- Product, Business, & Management Track ---
    "Product Management Intern",
    "Business Analyst Intern",
    "Project Management Intern",
    "Operations Intern",
    
    # --- Growth, Content, & Marketing Track ---
    "Marketing Intern",
    "Digital Marketing Intern",
    "Social Media Intern",
    "Content Writing Intern",
    "SEO Intern"
]

USER_AGENTS = [
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
    "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:121.0) Gecko/20100101 Firefox/121.0",
    "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.2 Safari/605.1.15"
]

def purge_expired_listings():
    print("\n🧹 Initiating Expired Link Validation & Purge Cycle...")
    try:
        response = supabase.table("listings").select("id", "role", "company", "link", "is_verified").execute()
        active_listings = response.data
        
        if not active_listings:
            print("📭 No active rows found in database to check.")
            return

        print(f"🕵️‍♂️ Scanning {len(active_listings)} total database entries for dead or expired links...")
        dead_row_ids = []

        for item in active_listings:
            # Skip manual posts made by admin through dashboard so they never auto-delete
            if item.get("is_verified") == True:
                continue

            url = item.get("link")
            row_id = item.get("id")
            
            if not url or not url.startswith("http"):
                continue

            headers = {"User-Agent": random.choice(USER_AGENTS)}

            try:
                res = requests.head(url, headers=headers, timeout=6, allow_redirects=True)
                
                if res.status_code in [404, 410]:
                    print(f"  ❌ DEAD LINK: [{item['company']}] {item['role']} -> Status {res.status_code}")
                    dead_row_ids.append(row_id)
                elif "linkedin.com/jobs/view" in url and "linkedin.com/jobs/search" in res.url:
                    print(f"  ❌ EXPIRED REDIRECT: [{item['company']}] {item['role']} (Job Filled/Removed)")
                    dead_row_ids.append(row_id)

            except requests.exceptions.Timeout as e:
                print(f"  ⏳ TIMEOUT: [{item['company']}] {item['role']} -> {e}")
                dead_row_ids.append(row_id)
            except requests.exceptions.ConnectionError as e:
                print(f"  ❌ CONNECTION ERROR: [{item['company']}] {item['role']} -> {e}")
                dead_row_ids.append(row_id)
            except requests.exceptions.RequestException as e:
                print(f"  ❌ UNREACHABLE DOMAIN: [{item['company']}] {item['role']} -> {e}")
                dead_row_ids.append(row_id)
            
            time.sleep(0.15)

        if dead_row_ids:
            print(f"\n🗑️ Vaporizing {len(dead_row_ids)} dead/expired rows from Supabase...")
            supabase.table("listings").delete().in_("id", dead_row_ids).execute()
            print("✨ Database successfully scrubbed clean of ghost postings!")
        else:
            print("✅ All active internship links tested pristine and live!")

    except Exception as e:
        print(f"⚠️ Link validation manager crashed: {e}")

def normalize_job_data(raw_data, source_platform):
    try:
        role = str(raw_data.get('role', '')).strip()
        company = str(raw_data.get('company', '')).strip()
        if not role or not company or role.lower() == 'nan' or company.lower() == 'nan':
            return None
            
        location = str(raw_data.get('location', '')).strip()
        if not location or location.lower() == 'nan':
            location = "Remote, India"
            
        link = str(raw_data.get('link', '')).strip()
        if not link or link.lower() == 'nan':
            return None

        logo = str(raw_data.get('logo', '')).strip()
        tags = raw_data.get('tags', [])
        if isinstance(tags, str):
            tags = [tags]
            
        stipend = 0
        raw_stipend = raw_data.get('stipend', 0)
        try:
            if raw_stipend and str(raw_stipend).lower() != 'nan':
                clean_stipend = str(raw_stipend).replace(',', '').replace('₹', '').replace('$', '')
                stipend = int(float(clean_stipend))
        except (ValueError, TypeError):
            pass

        return {
            "role": role,
            "company": company,
            "location": location,
            "logo": logo if logo and logo.lower() != 'nan' else None,
            "link": link,
            "tags": tags,
            "source": source_platform,
            "stipend": stipend,
            "is_verified": False
        }
    except Exception as e:
        print(f"⚠️ Data Normalization Error ({source_platform}): {e}")
        return None

# --- Platform Scrapers ---

def scrape_jobspy_platform(site_name, role_keyword):
    print(f"  [Thread] 🔍 Querying JobSpy ({site_name.upper()}) for '{role_keyword}'...")
    results = []
    try:
        jobs = scrape_jobs(
            site_name=[site_name],
            search_term=role_keyword,
            location="India",
            results_wanted=15,
            hours_old=72,
            country_shortcut="india"
        )
        if not jobs.empty:
            for _, row in jobs.iterrows():
                raw_data = {
                    'role': row.get('title'),
                    'company': row.get('company'),
                    'location': row.get('location'),
                    'link': row.get('job_url'),
                    'stipend': row.get('min_amount'),
                    'logo': row.get('company_logo') if 'company_logo' in row else ''
                }
                normalized = normalize_job_data(raw_data, site_name)
                if normalized:
                    results.append(normalized)
    except Exception as e:
        print(f"  ⚠️ Error scraping {site_name.upper()}: {e}")
    return results

def scrape_internshala(role_keyword):
    print(f"  [Thread] 🔍 Querying Internshala for '{role_keyword}'...")
    results = []
    try:
        formatted_keyword = role_keyword.lower().replace(' ', '-')
        url = f"https://internshala.com/internships/keywords-{formatted_keyword}/"
        headers = {"User-Agent": random.choice(USER_AGENTS)}
        res = requests.get(url, headers=headers, timeout=15)
        if res.status_code == 200:
            soup = BeautifulSoup(res.text, 'html.parser')
            job_cards = soup.find_all('div', class_='individual_internship')
            for card in job_cards[:15]:
                title_elem = card.find('h3', class_='job-internship-name')
                company_elem = card.find('p', class_='company-name')
                location_elem = card.find('a', class_='location_link')
                link_elem = card.find('a', class_='view_detail_button')
                
                if title_elem and company_elem:
                    link = "https://internshala.com" + link_elem['href'] if link_elem else url
                    raw_data = {
                        'role': title_elem.text.strip(),
                        'company': company_elem.text.strip(),
                        'location': location_elem.text.strip() if location_elem else 'Remote',
                        'link': link,
                        'source': 'internshala'
                    }
                    normalized = normalize_job_data(raw_data, 'internshala')
                    if normalized:
                        results.append(normalized)
    except Exception as e:
        print(f"  ⚠️ Error scraping Internshala: {e}")
    return results

def scrape_remoteok(role_keyword):
    print(f"  [Thread] 🔍 Querying RemoteOK for '{role_keyword}'...")
    results = []
    try:
        keyword = role_keyword.split()[0].lower()
        url = f"https://remoteok.com/api?tags={keyword}"
        headers = {"User-Agent": random.choice(USER_AGENTS)}
        res = requests.get(url, headers=headers, timeout=15)
        if res.status_code == 200:
            data = res.json()
            for job in data[1:15]:
                raw_data = {
                    'role': job.get('position'),
                    'company': job.get('company'),
                    'location': job.get('location', 'Remote'),
                    'link': job.get('url'),
                    'logo': job.get('company_logo'),
                    'tags': job.get('tags', [])
                }
                normalized = normalize_job_data(raw_data, 'remoteok')
                if normalized:
                    results.append(normalized)
    except Exception as e:
        print(f"  ⚠️ Error scraping RemoteOK: {e}")
    return results

def scrape_wellfound(role_keyword):
    print(f"  [Thread] 🔍 Querying Wellfound for '{role_keyword}' (Fallback)...")
    return []

def scrape_unstop(role_keyword):
    print(f"  [Thread] 🔍 Querying Unstop for '{role_keyword}'...")
    results = []
    try:
        url = "https://unstop.com/api/public/opportunity/search-result"
        params = {"keyword": role_keyword, "opportunity": "internships", "page": 1}
        headers = {"User-Agent": random.choice(USER_AGENTS)}
        res = requests.get(url, params=params, headers=headers, timeout=15)
        if res.status_code == 200:
            data = res.json()
            if 'data' in data and 'data' in data['data']:
                for item in data['data']['data'][:10]:
                    raw_data = {
                        'role': item.get('title'),
                        'company': item.get('organization', {}).get('name', 'Unstop Employer'),
                        'location': item.get('job_location', 'Remote, India'),
                        'link': f"https://unstop.com/{item.get('public_url')}",
                        'logo': item.get('logoUrl')
                    }
                    normalized = normalize_job_data(raw_data, 'unstop')
                    if normalized:
                        results.append(normalized)
    except Exception as e:
        print(f"  ⚠️ Error scraping Unstop: {e}")
    return results

def scrape_naukri(role_keyword):
    print(f"  [Thread] 🔍 Querying Naukri for '{role_keyword}'...")
    return []

def run_scraper_task(platform, role_keyword):
    time.sleep(random.uniform(0.1, 2.0))
    if platform in ["linkedin", "indeed", "glassdoor", "zip_recruiter", "google"]:
        return scrape_jobspy_platform(platform, role_keyword)
    elif platform == "internshala":
        return scrape_internshala(role_keyword)
    elif platform == "remoteok":
        return scrape_remoteok(role_keyword)
    elif platform == "wellfound":
        return scrape_wellfound(role_keyword)
    elif platform == "unstop":
        return scrape_unstop(role_keyword)
    elif platform == "naukri":
        return scrape_naukri(role_keyword)
    return []

def fetch_and_sync_internships():
    # 1. Clean out dead links from the current database first
    purge_expired_listings()
    
    print("\n🛰️ Initializing Master Multi-Role & Multi-Site Scraper Engine (Concurrent)...")
    
    platforms = [
        "linkedin", "indeed", "glassdoor", "zip_recruiter", "google",
        "internshala", "wellfound", "unstop", "remoteok", "naukri"
    ]
    
    listings_to_insert = []
    tasks = []
    for role_keyword in SEARCH_KEYWORDS:
        for platform in platforms:
            tasks.append((platform, role_keyword))
            
    print(f"🚀 Preparing {len(tasks)} distinct scraping tasks to run concurrently...")
            
    with concurrent.futures.ThreadPoolExecutor(max_workers=10) as executor:
        future_to_task = {executor.submit(run_scraper_task, platform, keyword): (platform, keyword) for platform, keyword in tasks}
        
        for future in concurrent.futures.as_completed(future_to_task):
            platform, keyword = future_to_task[future]
            try:
                results = future.result()
                if results:
                    listings_to_insert.extend(results)
                    print(f"    📦 [{platform.upper()}] '{keyword}' yielded {len(results)} records.")
            except Exception as exc:
                print(f"  💥 Fatal error in thread for {platform} - '{keyword}': {exc}")

    if not listings_to_insert:
        print("\n📭 Scraping process finished. Total fresh entries across all configurations: 0")
        return

    # De-duplicate the new scraped batch
    unique_listings = {}
    for job in listings_to_insert:
        key = (job["company"].lower(), job["role"].lower(), job["link"])
        unique_listings[key] = job
    
    deduped_listings_to_insert = list(unique_listings.values())

    print(f"\n📤 Scrape sequence complete! Syncing {len(deduped_listings_to_insert)} unique rows to Supabase...")
    
    try:
        # 🚨 THE REFACTOR TRICK: Drop old automated entries right before saving the fresh batch
        # This keeps user-posted test items intact ('is_verified' == true) but purges stale scraped ones
        print("🧹 Flushing unverified automated listings to clear out expired entries...")
        supabase.table("listings").delete().eq("is_verified", False).execute()
        
        # 2. Insert the brand new, updated crop of jobs
        supabase.table("listings").insert(deduped_listings_to_insert).execute()
        print(f"✨ Success! Database sync complete. Stale entries replaced with live postings.")
    except Exception as e:
        print(f"❌ Database synchronization batch write failed: {e}")

if __name__ == "__main__":
    fetch_and_sync_internships()