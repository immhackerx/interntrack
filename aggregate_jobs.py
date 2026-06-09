import os
from datetime import datetime
from jobspy import scrape_jobs
from supabase import create_client, Client

# 🔑 LINK YOUR SUPABASE CREDENTIALS
SUPABASE_URL = "https://vtzbrgcwhvicqpuwlxxc.supabase.co"
SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZ0emJyZ2N3aHZpY3FwdXdseHhjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODA3OTgwNjksImV4cCI6MjA5NjM3NDA2OX0.vkwTuZwGQY4dTM0Jp6hwGNPL6o9JetWagP0sQseyECU"

supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)

def fetch_and_sync_internships():
    print("🛰️ Initializing Enhanced Multi-Site Scraper Engine...")
    
    # 🌟 Added all 4 supported major global networks
    target_sites = ["linkedin", "indeed", "glassdoor", "zip_recruiter"]
    listings_to_insert = []
    
    for site in target_sites:
        print(f"🔍 Searching for fresh roles on {site.upper()}...")
        try:
            jobs = scrape_jobs(
                site_name=[site],
                search_term="Software Engineer Intern",
                location="India",
                results_wanted=100,  # Fetches up to 15 roles PER site now!
                hours_old=72,       # Pulls fresh listings from the last 3 days
                country_shortcut="india"
            )
            
            if jobs.empty:
                print(f"📭 No new roles found on {site.upper()}.")
                continue
                
            print(f"📦 Found {len(jobs)} rows on {site.upper()}. Mapping parameters...")
            
            # Map items to your Supabase schema
            for _, row in jobs.iterrows():
                role = row.get('title')
                company = row.get('company')
                if not role or not company:
                    continue
                    
                location = f"{row.get('location', 'Remote')}, India" if row.get('location') else "Remote, India"
                job_url = row.get('job_url', '')
                stipend = int(row.get('min_amount')) if row.get('min_amount') and not os.path.isna(row.get('min_amount')) else 0

                job_data = {
                    "role": str(role),
                    "company": str(company),
                    "location": str(location),
                    "stipend": stipend,
                    "link": str(job_url),
                    "is_verified": False  # Headed straight to your priyanshu2026 Admin review dashboard
                }
                listings_to_insert.append(job_data)
                
        except Exception as e:
            print(f"⚠️ Encountered a temporary block or error on {site.upper()}, skipping to next target... Error details: {e}")
            continue

    if not listings_to_insert:
        print("📭 Scraping process finished. Total fresh entries across all channels: 0")
        return

    print(f"🚀 Uploading {len(listings_to_insert)} total mixed rows to Supabase 'listings' table...")
    
    # EXECUTE BATCH BULK INSERT
    try:
        supabase.table("listings").insert(listings_to_insert).execute()
        print(f"✨ Success! Database sync complete. Multi-source pipeline integration finalized.")
    except Exception as e:
        print(f"❌ Database insertion failed: {e}")

if __name__ == "__main__":
    fetch_and_sync_internships()