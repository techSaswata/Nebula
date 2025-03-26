"use client"

import { initializeApp, getApp, getApps, FirebaseApp } from 'firebase/app';
// import { getAuth, Auth } from 'firebase/auth';
// import type { Analytics } from 'firebase/analytics';
import type { User } from 'firebase/auth';

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID
};

let firebaseApp: FirebaseApp | undefined;
// let firebaseAuth: Auth | null = null;
// let firebaseAnalytics: Analytics | null = null;

function initializeFirebase() {
  if (typeof window === 'undefined') return null;

  try {
    // Initialize Firebase
    if (!firebaseApp) {
      firebaseApp = !getApps().length ? initializeApp(firebaseConfig) : getApp();
    }
    return firebaseApp;
  } catch (error) {
    console.error('Error initializing Firebase:', error);
    return null;
  }
}

// Initialize Firebase in the browser
if (typeof window !== 'undefined') {
  initializeFirebase();
}

export const app = firebaseApp;

// Mock credentials for testing
const MOCK_CREDENTIALS = {
  email: 'saswata@gmail.com',
  password: 'sas123'
};

// Create a mock user type that matches the Firebase User interface
type MockUser = {
  email: string | null;
  uid: string;
  emailVerified: boolean;
  displayName: string | null;
  photoURL: string | null;
  metadata: {
    creationTime?: string;
    lastSignInTime?: string;
  };
  providerData: any[];
  refreshToken: string;
  tenantId: string | null;
  delete: () => Promise<void>;
  getIdToken: () => Promise<string>;
  getIdTokenResult: () => Promise<any>;
  reload: () => Promise<void>;
  toJSON: () => object;
};

// Export a mock auth object that requires manual login
export const auth = {
  currentUser: null as (MockUser | null),
  _listeners: new Set<(user: MockUser | null) => void>(),
  
  onAuthStateChanged(callback: (user: MockUser | null) => void) {
    this._listeners.add(callback);
    callback(this.currentUser);
    return () => {
      this._listeners.delete(callback);
    };
  },

  signInWithEmailAndPassword: async (email: string, password: string) => {
    if (email === MOCK_CREDENTIALS.email && password === MOCK_CREDENTIALS.password) {
      const mockUser: MockUser = {
        email: MOCK_CREDENTIALS.email,
        uid: '123',
        emailVerified: true,
        displayName: 'Test User',
        photoURL: null,
        metadata: {
          creationTime: new Date().toISOString(),
          lastSignInTime: new Date().toISOString(),
        },
        providerData: [],
        refreshToken: 'mock-refresh-token',
        tenantId: null,
        delete: async () => Promise.resolve(),
        getIdToken: async () => 'mock-token',
        getIdTokenResult: async () => ({
          token: 'mock-token',
          signInProvider: 'password',
          claims: {},
          authTime: new Date().toISOString(),
          issuedAtTime: new Date().toISOString(),
          expirationTime: new Date(Date.now() + 3600000).toISOString(),
        }),
        reload: async () => Promise.resolve(),
        toJSON: () => ({}),
      };
      auth.currentUser = mockUser;
      auth._listeners.forEach(listener => listener(mockUser));
      return Promise.resolve();
    }
    return Promise.reject(new Error('Invalid email or password'));
  },

  createUserWithEmailAndPassword: async (email: string, password: string) => {
    const mockUser: MockUser = {
      email,
      uid: Math.random().toString(36).substr(2, 9),
      emailVerified: false,
      displayName: null,
      photoURL: null,
      metadata: {
        creationTime: new Date().toISOString(),
        lastSignInTime: new Date().toISOString(),
      },
      providerData: [],
      refreshToken: 'mock-refresh-token',
      tenantId: null,
      delete: async () => Promise.resolve(),
      getIdToken: async () => 'mock-token',
      getIdTokenResult: async () => ({
        token: 'mock-token',
        signInProvider: 'password',
        claims: {},
        authTime: new Date().toISOString(),
        issuedAtTime: new Date().toISOString(),
        expirationTime: new Date(Date.now() + 3600000).toISOString(),
      }),
      reload: async () => Promise.resolve(),
      toJSON: () => ({}),
    };
    auth.currentUser = mockUser;
    auth._listeners.forEach(listener => listener(mockUser));
    return Promise.resolve();
  },

  signOut: async () => {
    auth.currentUser = null;
    auth._listeners.forEach(listener => listener(null));
    return Promise.resolve();
  },

  signInWithPopup: async () => {
    const mockUser: MockUser = {
      email: 'google@example.com',
      uid: '456',
      emailVerified: true,
      displayName: 'Google User',
      photoURL: 'https://example.com/photo.jpg',
      metadata: {
        creationTime: new Date().toISOString(),
        lastSignInTime: new Date().toISOString(),
      },
      providerData: [],
      refreshToken: 'mock-refresh-token',
      tenantId: null,
      delete: async () => Promise.resolve(),
      getIdToken: async () => 'mock-token',
      getIdTokenResult: async () => ({
        token: 'mock-token',
        signInProvider: 'google.com',
        claims: {},
        authTime: new Date().toISOString(),
        issuedAtTime: new Date().toISOString(),
        expirationTime: new Date(Date.now() + 3600000).toISOString(),
      }),
      reload: async () => Promise.resolve(),
      toJSON: () => ({}),
    };
    auth.currentUser = mockUser;
    auth._listeners.forEach(listener => listener(mockUser));
    return Promise.resolve();
  },
};

// Export a null analytics object
export const analytics = null; 