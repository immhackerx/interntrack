import os
import time
import pandas as pd
from datetime import datetime
from jobspy import scrape_jobs
from supabase import create_client, Client

# 🔑 LIVE SUPABASE CREDENTIALS ENCRYPTED MATRIX
SUPABASE_URL = "https://vtzbrgcwhvicqpuwlxxc.supabase.co"
SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZ0emJyZ2N3aHZpY3FwdXdseHhjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODA3OTgwNjksImV4cCI6MjA5NjM3NDA2OX0.vkwTuZwGQY4dTM0Jp6hwGNPL6o9JetWagP0sQseyECU"

supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)

def fetch_and_sync_internships():
    print("🛰️ Initializing Master Multi-Role & Multi-Site Scraper Engine...")
    
    # 🌐 Targeted platforms (Upgraded to include Naukri and Google Jobs)
    target_sites = ["linkedin", "indeed", "naukri", "google", "zip_recruiter"]
    
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
                    if not role or not company:
                        continue
                        
                    location = f"{row.get('location', 'Remote')}, India" if row.get('location') else "Remote, India"
                    job_url = row.get('job_url', '')
                    
                    # Safe NaN evaluation check for numeric fields
                    stipend = 0
                    min_amt = row.get('min_amount')
                    if min_amt and not pd.isna(min_amt):
                        stipend = int(min_amt)

                    job_data = {
                        "role": str(role),
                        "company": str(company),
                        "location": str(location),
                        "stipend": stipend,
                        "link": str(job_url),
                        "is_verified": False  # Headed straight to your priyanshu2026 admin panel review stream
                    }
                    listings_to_insert.append(job_data)
                    
                # ⏱️ Short pause to stay safe from bot detection filters
                time.sleep(1.5)
                    
            except Exception as e:
                print(f"  ⚠️ Skipping {site.upper()} momentarily: {e}")
                continue

    if not listings_to_insert:
        print("\n📭 Scraping process finished. Total fresh entries across all configurations: 0")
        return

    print(f"\n📤 Scrape sequence complete! Syncing {len(listings_to_insert)} unique rows to Supabase...")
    
    # ⚡ EXECUTING DE-DUPLICATED SMART UPSERT
    try:
        supabase.table("listings").upsert(
            listings_to_insert,
            on_conflict="company,role,link"  # Catches overlaps across your core database identifiers!
        ).execute()
        print(f"✨ Success! Database sync complete. All duplicate roles filtered and blocked.")
    except Exception as e:
        print(f"❌ Database insertion failed: {e}")

if __name__ == "__main__":
    fetch_and_sync_internships()