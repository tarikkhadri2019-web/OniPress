# OniPress — Complete Installation Guide (From Zero to Working)

## Who is this for?

This guide is for anyone with **no technical background**. You do not need to know programming.
Follow every step in order and OniPress will work on your PC.

---

## What You Are Installing

```
1. Node.js           — runs the OniPress dashboard on your computer
2. Antigravity IDE   — gives you free Gemini AI (no API key, just Gmail login)
3. OniPress          — the auto-blogging dashboard itself
4. WordPress Plugin  — connects OniPress to your WordPress website
```

**Total time: about 10–15 minutes.**

---

## PART 1 — Install Node.js

Node.js is a program that lets your computer run the OniPress dashboard.

### Windows

1. Open your browser and go to: **https://nodejs.org**
2. Click the big green button: **"Download Node.js (LTS)"**
3. Open the downloaded `.msi` file and click **Next → Next → Install**
4. When it finishes, click **Finish**

**Verify it installed correctly:**
- Press `Windows + R`, type `cmd`, press Enter
- In the black window that opens, type exactly:
  ```
  node --version
  ```
- You should see something like: `v22.0.0`
- If you see a version number, Node.js is installed ✅

### macOS

1. Open your browser and go to: **https://nodejs.org**
2. Click **"Download Node.js (LTS)"**
3. Open the downloaded `.pkg` file and follow the installer
4. Open **Terminal** (press `Cmd + Space`, type `Terminal`, press Enter)
5. Type: `node --version` — you should see a version number ✅

### Linux (Ubuntu/Debian)

Open a terminal and run:
```bash
curl -fsSL https://deb.nodesource.com/setup_lts.x | sudo -E bash -
sudo apt-get install -y nodejs
node --version
```

---

## PART 2 — Install Antigravity IDE (Free Gemini AI via Gmail)

Antigravity IDE is a **free** desktop application that gives OniPress access to Google Gemini AI using your Gmail account. **No API key or credit card needed.**

### Step 1 — Download Antigravity IDE

1. Open your browser and go to: **https://antigravity.ai**
2. Click **Download** (choose your operating system: Windows / Mac / Linux)
3. Open the installer file and follow the instructions

### Step 2 — Sign in with Gmail

1. Open the Antigravity IDE app
2. It will ask you to sign in — click **Sign in with Google**
3. Choose your **Gmail account** (any Gmail works, personal or professional)
4. Click **Allow** to grant access
5. You are now signed in — Antigravity will show your workspace

### Step 3 — Verify the `agy` CLI was installed

The Antigravity installer puts a tool called `agy` on your computer.

- **Windows**: Press `Windows + R`, type `cmd`, press Enter. Then type:
  ```
  agy --version
  ```
- **Mac/Linux**: Open Terminal and type:
  ```
  agy --version
  ```

You should see a version number. If you do, `agy` is installed ✅

> **Troubleshooting**: If `agy` is not found, close the terminal and open a new one. The installer
> adds it to your PATH and sometimes a new terminal window is needed.

### Step 4 — Test that agy works with your Gmail

Run this command in your terminal:

```bash
agy --print "Say hello in one sentence" --dangerously-skip-permissions
```

You should get a response like: `Hello! How can I help you today?`

If you get a response, Gemini AI is working with your Gmail ✅

> **💡 The IDE Bridge Rule**:  
> Keep Antigravity IDE open (or signed in) on your PC. OniPress uses PowerShell to connect to `agy` locally. Because you are signed in with your Gmail account, you will never be charged for API keys or hit credit card limits!

---

## PART 3 — Download and Run OniPress

### Option A — Download as ZIP (Easiest, no Git needed)

1. Go to the OniPress GitHub page: **https://github.com/tarikkhadri2019-web/OniPress**
2. Click the green **Code** button
3. Click **Download ZIP**
4. Extract the ZIP to a folder, for example: `C:\Users\YourName\Desktop\onipress`

### Option B — Clone with Git (If you have Git installed)

```bash
git clone https://github.com/tarikkhadri2019-web/OniPress.git
cd OniPress
```

### Install OniPress dependencies

Open a terminal/command prompt and navigate to the onipress folder:

**Windows:**
```
cd C:\Users\YourName\Desktop\onipress
npm install
```

**Mac/Linux:**
```bash
cd ~/Desktop/onipress
npm install
```

This will download the required packages. Wait until it finishes (about 30–60 seconds).

### Start OniPress

```bash
npm run dev
```

You will see output like:
```
▲ Next.js 16.3.4
- Local: http://localhost:3000
```

**Open your browser and go to: http://localhost:3000**

You should see the OniPress dashboard! ✅

> **IMPORTANT**: Keep this terminal window open. If you close it, OniPress stops.
> Every time you want to use OniPress, open a terminal in the onipress folder and run `npm run dev`.

---

## PART 4 — Install the WordPress Plugin

The OniPress Connect plugin lets your WordPress site receive articles from OniPress.

### Step 1 — Get the plugin file

In the OniPress dashboard (http://localhost:3000), go to the **Site Manager** tab.
You will see a **Download Plugin** button. Click it to download `onipress-connect.zip`.

*Alternatively, the zip file is also inside the onipress project folder at:*
`wp-plugin/onipress-connect/` *(you can zip this folder yourself)*

### Step 2 — Upload to WordPress

1. Log in to your WordPress admin panel (usually at `yourdomain.com/wp-admin`)
2. Go to **Plugins → Add New**
3. Click **Upload Plugin** (top of the page)
4. Click **Choose File** and select `onipress-connect.zip`
5. Click **Install Now**
6. After installation, click **Activate Plugin**

You should see **OniPress Connect** in your plugin list with a green **Active** label ✅

---

## PART 5 — Connect Your WordPress Site to OniPress

### Step 1 — Create a WordPress Application Password

Application Passwords are WordPress's secure way to let external apps post content.

1. In WordPress admin, go to **Users → Your Profile**
2. Scroll down to the **Application Passwords** section
3. In the **New Application Password Name** box, type: `OniPress`
4. Click **Add New Application Password**
5. WordPress shows you a password like: `AbCd eFgH iJkL mNoP qRsT uVwX`
6. **Copy this password immediately** — you cannot see it again after closing the page

### Step 2 — Add Your Site in OniPress

1. Open OniPress dashboard at **http://localhost:3000**
2. Click the **Site Manager** tab
3. Click **Add New Site**
4. Fill in the form:
   - **Site Name**: A name you choose (e.g. `My Travel Blog`)
   - **WordPress URL**: Your site's full URL (e.g. `https://mytravelblog.com`)
   - **Username**: Your WordPress admin username (the one you log in with)
   - **Application Password**: Paste the password you copied in Step 1
5. Click **Verify & Save**

If the connection works, you will see a green checkmark ✅

---

## PART 6 — Publish Your First AI Blog Post

1. In OniPress, click the **Write Blog** tab
2. From the **Target Site** dropdown, select your connected site
3. In the **Topic** box, write what you want the article to be about:
   - Example: `7 best budget smartphones for students in 2026`
   - Example: `How to grow tomatoes in a small apartment balcony`
   - Example: `Top 10 tourist attractions in Marrakech`
4. In **Focus Keyword**, enter the main keyword:
   - Example: `budget smartphones students`
5. Leave **Post Status** as **Publish** (or choose **Draft** to review before publishing)
6. Click the big **Generate & Publish** button

**Wait 30–60 seconds.** You will see status messages:
- `Connecting to Antigravity (Gemini via Gmail)...`
- `Writing deep H2/H3 body content & SEO FAQs via Gemini...`
- `Generating HD featured image & publishing to WordPress...`

When it finishes, you will see a green success message with a link to your new post! ✅

---

## Troubleshooting

### "agy is not recognized"
- Close your terminal and open a new one
- On Windows: make sure you installed Antigravity IDE and restarted the terminal
- Try: `C:\Users\YourName\AppData\Local\agy\bin\agy.exe --version`

### "npm is not recognized"
- Node.js was not installed correctly
- Go back to Part 1 and reinstall Node.js
- Make sure to restart your terminal after installation

### OniPress shows "Site not found"
- Make sure the OniPress Connect plugin is **Activated** in WordPress
- Check that the URL you entered matches your site (include `https://`)
- Make sure your Application Password is correct (no extra spaces)

### Article generation times out
- The `agy` CLI needs an active internet connection
- Make sure Antigravity IDE is installed and you are signed in with Gmail
- Try running `agy --print "test" --dangerously-skip-permissions` in your terminal first

### Port 3000 is already in use
Run on a different port:
```bash
npm run dev -- -p 3001
```
Then open http://localhost:3001

---

## How to Stop and Restart OniPress

**Stop**: Press `Ctrl + C` in the terminal where `npm run dev` is running.

**Start again** (next time you want to use OniPress):
1. Open a terminal
2. Navigate to the onipress folder:
   ```
   cd C:\Users\YourName\Desktop\onipress
   ```
3. Run:
   ```
   npm run dev
   ```
4. Open http://localhost:3000

Your sites and post history are saved automatically in the `data/` folder.

---

## Run on a Server (Optional — for 24/7 access)

If you want OniPress to always be online (not just when your PC is running), you can run it on a VPS server. This is optional and requires Linux knowledge.

```bash
# Install PM2 to keep OniPress running forever
npm install -g pm2

# Build for production
npm run build

# Start with PM2
pm2 start "npm start" --name onipress

# Auto-start on server reboot
pm2 startup
pm2 save
```

---

## Summary Checklist

Before your first post, make sure:

- [ ] Node.js installed (`node --version` works)
- [ ] Antigravity IDE installed and signed in with Gmail
- [ ] `agy --print "test" --dangerously-skip-permissions` returns a response
- [ ] OniPress running at http://localhost:3000
- [ ] OniPress Connect plugin uploaded and activated in WordPress
- [ ] WordPress Application Password created and saved in OniPress Site Manager
- [ ] Site shows green checkmark in Site Manager

If all boxes are checked, you are ready to publish your first AI blog post! 🚀
