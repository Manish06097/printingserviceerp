"use client";

import { useState, useEffect } from 'react';
import {Navbar} from '@/components/navbar'

export default function Dashboard() {
  const [userInfo, setUserInfo] = useState({
    userId: '',
    name: '',
    email: '',
    role: '',
  });

  useEffect(() => {
    // Check if we're in the browser
    if (typeof window !== 'undefined') {
      const getCookieValue = (name: string) => {
        const value = `; ${document.cookie}`;
        const parts = value.split(`; ${name}=`);
        if (parts.length === 2) return decodeURIComponent(parts.pop()?.split(';').shift() || '');
        return '';
      };

      const userId = getCookieValue('userId');
      const name = getCookieValue('name');
      const email = getCookieValue('email');
      const role = getCookieValue('role');

      setUserInfo({ userId, name, email, role });
    }
  }, []);

  return (
    <div>
      <h1>Dashboard</h1>
      <p>User ID: {userInfo.userId}</p>
      <p>Name: {userInfo.name}</p>
      <p>Email: {userInfo.email}</p>
      <p>Role: {userInfo.role}</p>
    </div>
  );
}
