# Setup Guide - Help Dad's Surgery Fundraising Website

This guide will walk you through setting up all the required services and deploying your fundraising website.

## Step 1: MongoDB Atlas Setup

1. **Create MongoDB Account**
   - Go to [mongodb.com/cloud/atlas](https://www.mongodb.com/cloud/atlas)
   - Sign up for a free account
   - Verify your email

2. **Create a Cluster**
   - Click "Create" to build your first cluster
   - Choose the free tier (M0)
   - Select a region close to your location
   - Click "Create Cluster" (takes ~2-3 minutes)

3. **Create a Database User**
   - In the left sidebar, go to "Database Access"
   - Click "Add New Database User"
   - Create a username and strong password
   - Note these credentials - you'll need them

4. **Allow Network Access**
   - In the left sidebar, go to "Network Access"
   - Click "Add IP Address"
   - Select "Allow Access from Anywhere" (for development)
   - Confirm

5. **Get Connection String**
   - Go to "Databases"
   - Click "Connect" on your cluster
   - Select "Connect with the MongoDB Node.js Driver"
   - Copy the connection string
   - Replace `<username>`, `<password>`, and `<database>` with your values
   - Save this as your `MONGODB_URI`

## Step 2: Cloudinary Setup

1. **Create Account**
   - Go to [cloudinary.com](https://cloudinary.com)
   - Sign up for a free account
   - Verify your email

2. **Get Credentials**
   - Go to your Dashboard
   - You'll see your "Cloud Name" at the top
   - In the left menu, go to "Settings"
   - Click the "API Keys" tab
   - You'll see your API Key

3. **Generate API Secret**
   - In the same API Keys section
   - Click "Generate New Secret" if needed
   - Copy your API Secret (keep this secret!)

4. **Save Credentials**
   - `CLOUDINARY_CLOUD_NAME`: Your cloud name
   - `CLOUDINARY_API_KEY`: Your API key
   - `CLOUDINARY_API_SECRET`: Your API secret

## Step 3: Local Development Setup

1. **Environment Variables**
   
   Create a `.env.local` file in your project root:
   ```env
   # MongoDB
   MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/help-dads-surgery?retryWrites=true&w=majority
   
   # Cloudinary
   CLOUDINARY_CLOUD_NAME=your_cloud_name
   CLOUDINARY_API_KEY=your_api_key
   CLOUDINARY_API_SECRET=your_api_secret
   
   # JWT Secret (generate a long random string)
   JWT_SECRET=your-super-secret-key-minimum-32-characters-long-change-this
   
   # Site URL
   NEXT_PUBLIC_SITE_URL=http://localhost:3000
   ```

2. **Generate JWT Secret**
   
   Generate a secure JWT secret:
   ```bash
   node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
   ```
   
   Copy the output and use it as your `JWT_SECRET`.

3. **Start Development Server**
   ```bash
   pnpm dev
   ```

4. **Test Local Setup**
   - Visit `http://localhost:3000` - should see homepage
   - Visit `http://localhost:3000/donate` - test donation form
   - Visit `http://localhost:3000/admin/login` - create your first admin account

## Step 4: Deployment to Vercel

1. **Push to GitHub**
   ```bash
   # Initialize git if not already done
   git init
   
   # Add all files
   git add .
   
   # Create initial commit
   git commit -m "Initial commit: Help Dad's Surgery fundraising website"
   
   # Add your GitHub repository as remote
   git remote add origin https://github.com/yourusername/help-dads-surgery.git
   
   # Push to GitHub
   git branch -M main
   git push -u origin main
   ```

2. **Connect to Vercel**
   - Go to [vercel.com](https://vercel.com)
   - Sign up with GitHub
   - Click "New Project"
   - Select your "help-dads-surgery" repository
   - Click "Import"

3. **Set Environment Variables**
   - In the "Environment Variables" section, add all from your `.env.local`:
     - `MONGODB_URI`
     - `CLOUDINARY_CLOUD_NAME`
     - `CLOUDINARY_API_KEY`
     - `CLOUDINARY_API_SECRET`
     - `JWT_SECRET`
     - `NEXT_PUBLIC_SITE_URL` = your Vercel domain (e.g., `https://help-dads-surgery.vercel.app`)

4. **Deploy**
   - Click "Deploy"
   - Wait for deployment to complete (usually 2-3 minutes)
   - Click "Visit" to see your live site

5. **Custom Domain** (Optional)
   - In Vercel project settings, go to "Domains"
   - Add your custom domain
   - Follow DNS instructions to point your domain to Vercel

## Step 5: Post-Deployment Setup

1. **Admin Account**
   - Visit your deployed site: `https://yourdomain.com/admin/login`
   - Click "Create Account" (first-time setup)
   - Enter username, email, and password
   - You're now logged in as admin

2. **Update Campaign Settings**
   - Go to Admin Dashboard > Settings
   - Update:
     - Target Amount
     - Campaign Title
     - Father's Name & Age
     - Hospital Name
     - Surgery Date
     - Contact Email & Phone
   - Click "Save"

3. **Add QR codes and UPI string (for Pay button + QR)**

   **UPI ID vs UPI string — not the same**
   - **UPI ID** (also called VPA): the address only, e.g. `yourname@paytm`, `family@ybl`, `merchant@phonepe`. It identifies *who* receives money.
   - **UPI string**: a full **payment link** the phone understands, always starting with `upi://pay?` and query parameters. Example:
     `upi://pay?pa=yourname@paytm&pn=Your%20Display%20Name&cu=INR`
   - The site stores the **UPI string** in each QR slot’s **UPI string** column (admin → QR codes). The donate page adds the **amount** (`am`) when the donor taps **Pay**.

   **PhonePe (and most apps) never show the words “UPI string”**  
   That label is only on **your website’s admin** field. In PhonePe you see **UPI ID** (e.g. `8367331109@ybl`) under your QR — that is the **address** part. You turn it into a UPI string by adding `upi://pay?pa=...&pn=...&cu=INR` (see below).

   **How to fill the admin “UPI string” field**

   1. **Copy your UPI ID from PhonePe**  
      Open **Profile / My QR** (or **My QR**). Note the line **UPI ID:** `something@ybl` (or `@ibl`, etc.). Tap **View UPI details** if you need to see or pick the ID.

   2. **Type this one line** into admin → QR codes → **UPI string** (replace with your real values):  
      `upi://pay?pa=8367331109@ybl&pn=Sandy&cu=INR`  
      - **`pa`** = your UPI ID **exactly** as shown (e.g. `8367331109@ybl`).  
      - **`pn`** = short name shown to payers (no spaces, or use `%20` for a space, e.g. `Sandy%20K`).  
      - **`cu`** = always `INR` for India.  
      Do **not** add `am=` here — the donate page adds the amount when someone taps **Pay**.

   3. **Optional — if another app offers “Copy payment link”**  
      Some apps expose the full `upi://pay?...` text; you can paste that as-is (remove any `am=` if you want the site to control amount).

   **Same idea in one line:**  
   `upi://pay?pa=YOUR_UPI_ID&pn=YOUR_NAME&cu=INR`

   **Image URL**  
   Upload or paste the QR **image** URL (e.g. Cloudinary) as today — it should match the same VPA as the UPI string.

4. **Add Medical Documents**
   - Go to Admin Dashboard > Medical Reports
   - Click "Upload Document"
   - Select files and category
   - They'll appear on the public Medical Reports page

5. **Publish First Update**
   - Go to Admin Dashboard > Updates
   - Click "Create Update"
   - Add title, content, and optional image
   - Click "Publish"

## Step 6: Customize Content

### Update Homepage
Edit `/app/page.tsx`:
- Change "Help Dad's Surgery" to your campaign title
- Update the hero section text
- Modify campaign description
- Update contact information

### Update Footer
Edit `/components/Footer.tsx`:
- Add actual contact email and phone
- Add social media links
- Update address

### Update Medical Reports
Edit `/app/medical/page.tsx`:
- Ensure doctor's recommendations are current
- Add specific hospital details
- Include actual medical report titles

## Troubleshooting

### MongoDB Connection Issues
```bash
# Test connection locally
npm run test-db
```

If failing:
- Check IP whitelist in MongoDB Atlas Network Access
- Verify username and password
- Ensure database user has Atlas user privilege

### Cloudinary Upload Issues
- Verify API credentials are correct
- Check file size is under 10MB
- Ensure file format is supported

### Admin Login Issues
Clear cookies and try again:
```javascript
// In browser console
document.cookie = "admin_token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
```

### Vercel Deployment Issues
- Check build logs in Vercel dashboard
- Ensure all environment variables are set
- Try redeploying: `git push origin main`

### Pay / `upi://` link opens WhatsApp or the wrong app

This almost always means the donate page was opened **inside WhatsApp** (or Instagram/Facebook in-app browser). Those webviews do not handle UPI deep links the same way as **Chrome** or **Safari**.

**Fix:** Open the site in a real browser: from WhatsApp tap **⋮** (or **Share**) → **Open in Chrome** / **Open in Safari** — then use **Pay** again. Do not paste `upi://pay?...` into a WhatsApp chat and tap it there; open the **donate page** in the browser and use the green **Pay** button.

If Android still shows the wrong app after opening in Chrome, pick **PhonePe** (or your bank app) in the system **“Open with”** list when it appears.

### Pay on a Mac or Windows laptop opens WhatsApp (or nothing useful)

**That is expected, not a bug in your UPI string.** UPI (`upi://`) is meant for **phones** (Android / iPhone). On a laptop, Chrome may send the link to whatever app registered the scheme—sometimes **WhatsApp**—or fail silently.

**Fix:** Open the donate page on your **phone** and tap **Pay**, or **scan the QR** with PhonePe (or any UPI app) on the phone. The live site disables the Pay button on desktop and explains this in the UI.

## Security Checklist

- [ ] JWT_SECRET is long and random (min 32 characters)
- [ ] CLOUDINARY_API_SECRET not exposed in code
- [ ] MONGODB_URI not in version control
- [ ] Admin password is strong
- [ ] Email and phone contacts updated
- [ ] NEXT_PUBLIC_SITE_URL updated after deployment

## Ongoing Maintenance

### Regular Updates
- Add campaign updates weekly
- Share medical progress
- Thank donors publicly
- Update fundraising progress

### Monitor Donations
- Check admin dashboard daily
- Approve/verify manual donations
- Respond to donor inquiries
- Update campaign settings as needed

### Backup Important Data
- Export donation records monthly
- Backup medical documents
- Save campaign updates

## Support Resources

- [MongoDB Documentation](https://docs.mongodb.com)
- [Cloudinary Documentation](https://cloudinary.com/documentation)
- [Next.js Documentation](https://nextjs.org/docs)
- [Vercel Documentation](https://vercel.com/docs)

## Getting Help

If you encounter issues:
1. Check the README.md file
2. Review the troubleshooting section above
3. Check service documentation
4. Contact their support teams

---

Good luck with your fundraising campaign! Remember that transparency and regular updates are key to building trust with donors.
