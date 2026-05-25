This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, copy the example env file and fill in your Cloudinary details:

```bash
cp .env.example .env.local
```

Then install dependencies and run the development server:

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

The app is already configured for Firebase Authentication, Firestore, and Cloudinary uploads.

### Firebase setup

- Your Firebase Web App config is already included in `src/lib/firebase.ts` using environment variables.
- Use `firestore.rules` from the project root to secure Firestore access.
- The admin account is expected to use:
  - Email: `admin@gmail.com`
  - Password: `admin123`

### Project features

- Arabic RTL responsive UI for children
- Child dashboard with mood tracker, problem report form, and file uploads
- Real-time chat system with simulated supportive responses
- Zoom meeting booking request system
- Educational videos library
- Talents upload section
- Admin dashboard with moderation and stats

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load Arabic-friendly fonts.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
