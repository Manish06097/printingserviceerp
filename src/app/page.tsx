// src/app/page.tsx

import { redirect } from 'next/navigation';

export default function Home() {
  // Redirect to the dashboard page when visiting the home page
  redirect('/dashboard');
}
