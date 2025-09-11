import axios from 'axios';
import { OAuth2Client } from 'google-auth-library';
import { google } from 'googleapis';
import { FacebookAdsApi, User as FBUser } from 'facebook-nodejs-business-sdk';
import { prisma } from '../db/db.js';
import { Platform } from '@prisma/client';

// /src/services/oauth.services.ts

// Google setup
const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID!;
const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET!;
const GOOGLE_REDIRECT_URI = process.env.GOOGLE_REDIRECT_URI!;
const googleOauth2Client = new OAuth2Client({
  clientId: GOOGLE_CLIENT_ID,
  clientSecret: GOOGLE_CLIENT_SECRET,
  redirectUri: GOOGLE_REDIRECT_URI,
});
const GOOGLE_SCOPES = [
  'https://www.googleapis.com/auth/adwords',
];

// Meta setup
const META_CLIENT_ID = process.env.META_CLIENT_ID!;
const META_CLIENT_SECRET = process.env.META_CLIENT_SECRET!;
const META_REDIRECT_URI = process.env.META_REDIRECT_URI!;

export const oauthService = {
  // Google: Get OAuth URL
  getGoogleAuthUrl() {
    return googleOauth2Client.generateAuthUrl({
      access_type: 'offline',
      prompt: 'consent',
      scope: GOOGLE_SCOPES,
    });
  },

  // Google: Handle Callback
  async handleGoogleCallback(code: string, userId: string) {
    const { tokens } = await googleOauth2Client.getToken(code);
    googleOauth2Client.setCredentials(tokens);

    const oauth2 = google.oauth2({
      auth: googleOauth2Client,
      version: 'v2',
    });
    const userInfo = await oauth2.userinfo.get();
    const providerUserId = userInfo.data.id!;

    await prisma.platformConnection.upsert({
      where: {
        platform_userId: {
          platform: Platform.GOOGLE,
          userId: userId,
        },
      },
      update: {
        accessToken: tokens.access_token!,
        refreshToken: tokens.refresh_token ?? null,
        expiresAt: tokens.expiry_date ? new Date(tokens.expiry_date) : null,
        providerUserId,
      },
      create: {
        platform: Platform.GOOGLE,
        providerUserId,
        accessToken: tokens.access_token!,
        refreshToken: tokens.refresh_token ?? null,
        expiresAt: tokens.expiry_date ? new Date(tokens.expiry_date) : null,
        userId,
      },
    });
  },

  // Meta: Get OAuth URL
  getMetaAuthUrl() {
    return `https://www.facebook.com/v16.0/dialog/oauth?client_id=${META_CLIENT_ID}&redirect_uri=${encodeURIComponent(META_REDIRECT_URI)}&scope=ads_management`;
  },

  // Meta: Handle Callback
  async handleMetaCallback(code: string, userId: string) {
    const tokenResp = await axios.get('https://graph.facebook.com/v16.0/oauth/access_token', {
      params: {
        client_id: META_CLIENT_ID,
        redirect_uri: META_REDIRECT_URI,
        client_secret: META_CLIENT_SECRET,
        code,
      },
    });

    const { access_token, expires_in } = tokenResp.data;
    if (!access_token) {
      throw new Error('Failed to obtain access token from Meta');
    }

    FacebookAdsApi.init(access_token);
    const me = await (new FBUser('me')).get(['id', 'name', 'email']);
    const providerUserId = me.id;

    await prisma.platformConnection.upsert({
      where: {
        platform_userId: {
          platform: Platform.META,
          userId: userId,
        },
      },
      update: {
        accessToken: access_token,
        refreshToken: null,
        expiresAt: new Date(Date.now() + expires_in * 1000),
        providerUserId,
      },
      create: {
        platform: Platform.META,
        providerUserId,
        accessToken: access_token,
        refreshToken: null,
        expiresAt: new Date(Date.now() + expires_in * 1000),
        userId,
      },
    });
  },
};
