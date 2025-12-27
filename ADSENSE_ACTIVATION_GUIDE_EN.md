# Step-by-Step Google AdSense Activation Guide

This guide explains in detail how to start from the Google AdSense website and activate ads on your "Wazefni Now" website.

## Part 1: Registration and Getting the Code (Google Side)

1.  **Sign Up:**
    *   Go to [Google AdSense](https://adsense.google.com).
    *   Click **"Get started"**.
    *   Sign in with your Google account.
    *   Enter your website URL (e.g., `wazfni-now.com`).

2.  **Get Your Publisher ID:**
    *   Once inside the AdSense dashboard.
    *   Go to **Account** > **Settings** > **Account information**.
    *   Find the "Publisher ID" which looks like `pub-xxxxxxxxxxxxxxxx`.
    *   **Copy this ID.** (Example: `pub-5419188736421421`).

3.  **Get the Verification Code (Optional/For Auto Ads):**
    *   On the AdSense homepage, you might be asked to "Connect your site".
    *   They will provide a "Code snippet" that looks like this:
        ```html
        <script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-xxxxxxxxxxxxxxxx" crossorigin="anonymous"></script>
        ```
    *   Our system handles this automatically. You just need the Publisher ID.

---

## Part 2: Connect the Website (Your Admin Panel)

1.  **Access Admin Panel:**
    *   Log in as an Admin on your site.
    *   Go to **Dashboard** > **Google AdSense**.

2.  **Enter Data:**
    *   In the **"Publisher ID"** field, paste the ID you copied (e.g., `pub-5419188736421421`).
    *   Ensure **"Enable Ads on Site"** is checked.

3.  **Auto Ads Option:**
    *   If you want Google to automatically place ads where it sees fit:
        *   Enable the **"Hide Placeholders (For Auto Ads)"** option.
        *   This hides the manual empty boxes on your site, letting Google fill the space dynamically.

4.  Click **"Save Settings"**.

---

## Part 3: Creating Ad Units (Manual Ads)

If you prefer NOT to use "Auto Ads" and want to control exact ad locations (e.g., a specific banner at the top of the Home page):

1.  **In Google AdSense:**
    *   Go to **Ads** > **By ad unit**.
    *   Choose **"Display ads"** (Recommended).
    *   Name the unit (e.g., `Home Header`).
    *   For "Ad size", choose **"Responsive"**.
    *   Click **"Create"**.
    *   You will see HTML code. Look inside for: `data-ad-slot="1234567890"`.
    *   **Copy ONLY the Slot ID** (the number).

2.  **In Your Admin Panel:**
    *   Go to the **"Ad Units"** section in the AdSense tab.
    *   Click **"New Unit"**.
    *   **Name:** Give it a descriptive name (e.g., Home Top Banner).
    *   **Slot ID:** Paste the number you copied (`1234567890`).
    *   **Placement:** Select where this ad should appear (e.g., `home_top`).
        *   *(A full list of placements is available in `ADSENSE_SETUP_AR.md`)*.
    *   Ensure **"Enable Unit"** is checked.
    *   Click **"Add"**.

## When Will Ads Appear?
*   After completing these steps, Google may take anywhere from **1 hour to 24 hours** to review your site and start displaying ads.
*   Initially, you might see blank spaces until full approval is granted.



 
