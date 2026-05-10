# Help Dad's Surgery - Lung Transplant Fundraising Website

A professional, human-centered fundraising platform for medical emergencies featuring transparent donation tracking, admin dashboard, and real-time campaign management.

## Features

### Public Website
- **Homepage**: Compelling narrative with progress tracking and recent donations
- **Donation Page**: Multiple UPI payment options (Google Pay, PhonePe, Paytm) with QR code scanning
- **Updates Page**: Timeline of campaign progress and medical journey
- **Medical Reports**: Transparent sharing of medical documentation with categorization
- **Contact Page**: Direct communication with FAQs and support channels

### Admin Dashboard
- **Real-time Analytics**: Donation tracking, fundraising progress, QR code performance metrics
- **Donation Management**: Review, approve, and reject donations with manual entry support
- **Campaign Settings**: Configure target amount, campaign details, and contact information
- **Medical Document Management**: Upload and organize medical reports by category
- **Campaign Updates**: Create and publish progress updates with images

### Security & Authentication
- JWT-based admin authentication with secure HTTP-only cookies
- Role-based access control for admin functions
- Middleware protection for admin routes
- Password hashing with bcryptjs
- Input validation with Zod schemas

## Technology Stack

### Frontend
- **Framework**: Next.js 15 (App Router)
- **Styling**: Tailwind CSS
- **UI Components**: shadcn/ui
- **Charts**: Recharts
- **Icons**: Lucide React
- **Date Formatting**: date-fns

### Backend
- **Database**: MongoDB Atlas
- **Authentication**: JWT with bcryptjs
- **File Storage**: Cloudinary (images and documents)
- **API**: Next.js API Routes
- **Validation**: Zod

### Deployment
- **Host**: Vercel
- **Domain**: Custom domain ready

## Getting Started

### Prerequisites
- Node.js 18+ and pnpm
- MongoDB Atlas account
- Cloudinary account
- GitHub account (for deployment)

### Installation

1. **Clone and setup**
   ```bash
   # Clone the repository
   git clone <your-repo-url>
   cd help-dads-surgery
   
   # Install dependencies
   pnpm install
   ```

2. **Configure environment variables**
   
   Create a `.env.local` file:
   ```env
   MONGODB_URI=mongodb+srv://user:password@cluster.mongodb.net/help-dads-surgery
   CLOUDINARY_CLOUD_NAME=your_cloud_name
   CLOUDINARY_API_KEY=your_api_key
   CLOUDINARY_API_SECRET=your_api_secret
   JWT_SECRET=your-super-secret-jwt-key-min-32-chars
   NEXT_PUBLIC_SITE_URL=http://localhost:3000
   ```

3. **Start development server**
   ```bash
   pnpm dev
   ```

4. **Create admin account**
   - Navigate to `http://localhost:3000/admin/login`
   - Since this is first-time setup, click "Create Account" to register
   - Use any username and password

## Project Structure

```
├── app/
│   ├── layout.tsx                 # Root layout with Header/Footer
│   ├── page.tsx                   # Homepage
│   ├── donate/page.tsx            # Donation page
│   ├── updates/page.tsx           # Campaign updates
│   ├── medical/page.tsx           # Medical reports
│   ├── contact/page.tsx           # Contact page
│   ├── admin/
│   │   ├── login/page.tsx         # Admin login/signup
│   │   └── dashboard/page.tsx     # Admin dashboard
│   ├── api/
│   │   ├── donations/             # Donation endpoints
│   │   ├── medical/               # Medical report endpoints
│   │   ├── updates/               # Campaign update endpoints
│   │   ├── settings/              # Settings endpoints
│   │   ├── admin/auth/            # Authentication endpoints
│   │   └── upload/                # File upload endpoint
│   ├── privacy/page.tsx           # Privacy policy
│   └── terms/page.tsx             # Terms of service
├── components/
│   ├── Header.tsx                 # Navigation header
│   ├── Footer.tsx                 # Footer
│   ├── DonationCard.tsx           # Donation display card
│   ├── ProgressBar.tsx            # Fundraising progress
│   ├── QRCodeDisplay.tsx          # UPI QR code display
│   ├── MedicalReportCard.tsx      # Medical report card
│   ├── UpdateCard.tsx             # Campaign update card
│   └── AdminDashboardClient.tsx   # Admin dashboard tabs
├── lib/
│   ├── mongodb.ts                 # MongoDB connection
│   ├── models.ts                  # Database schemas
│   ├── auth.ts                    # JWT utilities
│   ├── validations.ts             # Input validation schemas
│   └── cloudinary.ts              # Cloudinary utilities
├── middleware.ts                  # Admin route protection
└── public/                        # Static assets

```

## Database Models

### Admin
- username, password (hashed), email, lastLogin

### Donation
- donorName, amount, paymentMethod, status, upiCode, transactionId, isAnonymous, notes

### QR Code
- code, upiString, provider, displayName, isActive, scannedCount, clickCount, imageUrl

### Medical Report
- title, category, description, date, doctorName, hospital, documentUrl, isPublic

### Campaign Update
- title, content, author, date, imageUrl, isPublished

### Campaign Settings
- targetAmount, campaignTitle, fatherName, hospitalName, emailContact, phoneContact

## API Endpoints

### Public
- `GET /api/donations` - List public donations
- `POST /api/donations` - Create new donation
- `GET /api/medical` - Get public medical reports
- `GET /api/updates?published=true` - Get published updates
- `GET /api/settings` - Get campaign settings

### Admin (Protected)
- `POST /api/admin/auth` - Login, register, logout
- `PATCH /api/donations/[id]` - Approve donation
- `DELETE /api/donations/[id]` - Reject donation
- `POST /api/upload` - Upload files to Cloudinary
- `POST /api/medical` - Create medical report
- `POST /api/updates` - Create campaign update
- `PUT /api/settings` - Update settings

## Security Features

- **JWT Authentication**: Secure token-based admin access
- **HTTP-Only Cookies**: Prevents XSS attacks
- **Password Hashing**: bcryptjs for secure password storage
- **Input Validation**: Zod schemas prevent invalid data
- **Middleware Protection**: Admin routes blocked without authentication
- **CORS Ready**: API designed for secure cross-origin requests

## Customization

### Change Campaign Details
Edit `/app/api/settings/route.ts` for default values or use admin dashboard.

### Update Colors
Modify the Tailwind color classes in components. Main colors:
- Primary: emerald (green)
- Secondary: blue, purple
- Neutrals: gray

### Add Payment Methods
Update the payment method options in donation validation and UI components.

## Deployment to Vercel

1. **Push to GitHub**
   ```bash
   git push origin main
   ```

2. **Connect to Vercel**
   - Go to vercel.com and import the repository
   - Add environment variables in Vercel project settings
   - Deploy

3. **Configure Domain**
   - Update `NEXT_PUBLIC_SITE_URL` environment variable
   - Add custom domain in Vercel project settings

## Testing

### Manual Testing Checklist
- [ ] Homepage loads with progress bar
- [ ] Donation form accepts valid amounts
- [ ] UPI QR codes display correctly
- [ ] Admin login creates account on first use
- [ ] Donations appear in admin dashboard
- [ ] Admin can approve/reject donations
- [ ] Medical reports upload successfully
- [ ] Campaign updates publish correctly

## Troubleshooting

### MongoDB Connection Issues
- Verify connection string includes credentials
- Check IP whitelist in MongoDB Atlas
- Ensure database user has correct permissions

### Cloudinary Upload Errors
- Verify API credentials in environment variables
- Check file size limits (max 10MB)
- Ensure CLOUDINARY_CLOUD_NAME is correct

### Admin Login Issues
- Clear browser cookies if token is stale
- Check JWT_SECRET is set
- Verify MongoDB is running

## Performance Optimization

- Images optimized via Cloudinary
- Lazy loading for components
- Server-side rendering for SEO
- Database indexing on key fields
- Chart data limited to essential metrics

## Support & Maintenance

For issues or feature requests:
1. Check the troubleshooting section
2. Review API responses for error messages
3. Check browser console for client-side errors
4. Contact support at contact@example.com

## License

This project is created for medical fundraising purposes. Please respect the privacy and dignity of the patient.

---

**Built with ❤️ for a worthy cause**
