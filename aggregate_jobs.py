import os
import time
import random
import pandas as pd
import requests  # ⚡ NEW: Imported to ping and validate active URL health statuses
from datetime import datetime
from jobspy import scrape_jobs
from supabase import create_client, Client

# 🔑 LIVE SUPABASE CREDENTIALS ENCRYPTED MATRIX
SUPABASE_URL = "https://vtzbrgcwhvicqpuwlxxc.supabase.co"
SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZ0emJyZ2N3aHZpY3FwdXdseHhjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODA3OTgwNjksImV4cCI6MjA5NjM3NDA2OX0.vkwTuZwGQY4dTM0Jp6hwGNPL6o9JetWagP0sQseyECU"

supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)

def purge_expired_listings():
    print("\n🧹 Initiating Expired Link Validation & Purge Cycle...")
    try:
        # Fetch every active listing link stored in the database
        response = supabase.table("listings").select("id", "role", "company", "link").execute()
        active_listings = response.data
        
        if not active_listings:
            print("📭 No active rows found in database to check.")
            return

        print(f"🕵️‍♂️ Scanning {len(active_listings)} total database entries for dead or expired links...")
        dead_row_ids = []

        user_agents = [
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
            "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:121.0) Gecko/20100101 Firefox/121.0",
            "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.2 Safari/605.1.15"
        ]

        for item in active_listings:
            url = item.get("link")
            row_id = item.get("id")
            
            if not url or not url.startswith("http"):
                continue

            headers = {"User-Agent": random.choice(user_agents)}

            try:
                # Use a fast HEAD request to grab the response code without parsing full HTML weights
                res = requests.head(url, headers=headers, timeout=6, allow_redirects=True)
                
                # Check for absolute dead statuses (404, 410)
                if res.status_code in [404, 410]:
                    print(f"  ❌ DEAD LINK: [{item['company']}] {item['role']} -> Status {res.status_code}")
                    dead_row_ids.append(row_id)
                
                # Check for dead board redirects (e.g., LinkedIn pushing a filled job view back to generic searches)
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
            
            # Short split-second break to space out validation traffic patterns nicely
            time.sleep(0.15)

        # Batch execute the delete query for all compiled dead elements
        if dead_row_ids:
            print(f"\n🗑️ Vaporizing {len(dead_row_ids)} dead/expired rows from Supabase...")
            supabase.table("listings").delete().in_("id", dead_row_ids).execute()
            print("✨ Database successfully scrubbed clean of ghost postings!")
        else:
            print("✅ All active internship links tested pristine and live!")

    except Exception as e:
        print(f"⚠️ Link validation manager crashed: {e}")


def fetch_and_sync_internships():
    # ⚡ STEP 1: Execute deep data cleanup before running scraper streams
    purge_expired_listings()
    
    print("\n🛰️ Initializing Master Multi-Role & Multi-Site Scraper Engine...")
    
    # 🌐 Base source platforms
    base_sites = ["linkedin", "indeed", "naukri", "google", "zip_recruiter"]
    
    # 🎯 The Absolute Master Index Matrix of Student Internships
    search_keywords = [
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
    
    listings_to_insert = []
    
    # 🔁 Outer Loop: Cycle through every role type
    for role_keyword in search_keywords:
        print(f"\n🚀 Starting search sequence for category: [{role_keyword.upper()}]")
        
        # ⚡ NEW: Shuffle the target board order dynamically for every keyword path pass
        target_sites = base_sites.copy()
        random.shuffle(target_sites)
        print(f"🔀 Randomized scraping order for this pass: {[s.upper() for s in target_sites]}")
        
        # 🔁 Inner Loop: Query platforms one by one
        for site in target_sites:
            print(f"  🔍 Querying {site.upper()} for '{role_keyword}'...")
            try:
                jobs = scrape_jobs(
                    site_name=[site],
                    search_term=role_keyword,
                    location="India",
                    results_wanted=20,  # Optimized 20-job quota per run execution
                    hours_old=72,       # Pulls fresh listings from the last 3 days
                    country_shortcut="india"
                )
                
                if jobs.empty:
                    continue
                    
                print(f"    📦 Found {len(jobs)} potential records on {site.upper()}. Processing rows...")
                
                # Format rows into your exact Supabase schema layout
                for _, row in jobs.iterrows():
                    role = row.get('title')
                    company = row.get('company')
                    if pd.isna(role) or pd.isna(company) or not role or not company:
                        continue
                        
                    location_val = row.get('location')
                    location = f"{location_val}, India" if location_val and not pd.isna(location_val) else "Remote, India"
                    
                    job_url = row.get('job_url')
                    job_url_str = str(job_url) if job_url and not pd.isna(job_url) else ""
                    
                    # Safe NaN evaluation check for numeric fields
                    stipend = 0
                    min_amt = row.get('min_amount')
                    if min_amt is not None and not pd.isna(min_amt):
                        try:
                            stipend = int(min_amt)
                        except (ValueError, TypeError):
                            pass

                    job_data = {
                        "role": str(role),
                        "company": str(company),
                        "location": str(location),
                        "stipend": stipend,
                        "link": job_url_str,
                        "is_verified": False  # Headed straight to your priyanshu2026 admin panel review stream
                    }
                    listings_to_insert.append(job_data)
                    
                # ⏱️ UPDATED: Shifted to a random pause range between 2.5 and 5.0 seconds to cleanly bypass scraping triggers
                sleep_interval = random.uniform(2.5, 5.0)
                time.sleep(sleep_interval)
                    
            except Exception as e:
                print(f"  ⚠️ Skipping {site.upper()} momentarily: {e}")
                continue

    if not listings_to_insert:
        print("\n📭 Scraping process finished. Total fresh entries across all configurations: 0")
        return

    # De-duplicate the batch itself to prevent PostgreSQL unique constraint errors
    unique_listings = {}
    for job in listings_to_insert:
        key = (job["company"], job["role"], job["link"])
        unique_listings[key] = job
    
    deduped_listings_to_insert = list(unique_listings.values())

    print(f"\n📤 Scrape sequence complete! Syncing {len(deduped_listings_to_insert)} unique rows to Supabase...")
    
    # ⚡ EXECUTING DE-DUPLICATED SMART UPSERT
    try:
        supabase.table("listings").upsert(
            deduped_listings_to_insert,
            on_conflict="company,role,link"  # Catches overlaps across your core database identifiers!
        ).execute()
        print(f"✨ Success! Database sync complete. All duplicate roles filtered and blocked.")
    except Exception as e:
        print(f"❌ Database insertion failed: {e}")

if __name__ == "__main__":
    fetch_and_sync_internships()