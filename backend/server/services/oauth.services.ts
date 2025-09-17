import axios from 'axios';
import { OAuth2Client } from 'google-auth-library';
import { google } from 'googleapis';
import { prisma } from '@shared/db/db.js';
import { Platform } from '@prisma/client';
import { getSuccessTokens } from 'server/utils/helpers.util.js';

// /server/services/oauth.services.ts

// Google setup
const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID!;
const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET!;
const GOOGLE_CONNECT_CALLBACK_URL = process.env.GOOGLE_CONNECT_CALLBACK_URL!;
const GOOGLE_LOGIN_CALLBACK_URL = process.env.GOOGLE_LOGIN_CALLBACK_URL!;
const googleOauth2Client = new OAuth2Client({
  clientId: GOOGLE_CLIENT_ID,
  clientSecret: GOOGLE_CLIENT_SECRET,
  redirectUri: GOOGLE_CONNECT_CALLBACK_URL, // default, will override for login
});
const GOOGLE_SCOPES = ['https://www.googleapis.com/auth/adwords'];
const GOOGLE_LOGIN_SCOPES = ['openid', 'email', 'profile'];

// Meta setup
const META_CLIENT_ID = process.env.META_CLIENT_ID!;
const META_CLIENT_SECRET = process.env.META_CLIENT_SECRET!;
const META_CONNECT_CALLBACK_URL = process.env.META_CONNECT_CALLBACK_URL!;
const META_LOGIN_CALLBACK_URL = process.env.META_LOGIN_CALLBACK_URL!;
const META_GRAPH_API_URL = process.env.META_GRAPH_API_URL!;

export const oauthService = {
  // -------------------
  // Google URLs
  // -------------------
  getGoogleConnectUrl() {
    return googleOauth2Client.generateAuthUrl({
      access_type: 'offline',
      prompt: 'consent',
      scope: GOOGLE_SCOPES,
      redirect_uri: GOOGLE_CONNECT_CALLBACK_URL,
    });
  },

  getGoogleLoginUrl() {
    return googleOauth2Client.generateAuthUrl({
      access_type: 'offline',
      prompt: 'consent',
      scope: GOOGLE_LOGIN_SCOPES,
      redirect_uri: GOOGLE_LOGIN_CALLBACK_URL,
    });
  },

  // -------------------
  // Meta URLs
  // -------------------
  getMetaConnectUrl() {
    return `https://www.facebook.com/v16.0/dialog/oauth?client_id=${META_CLIENT_ID}&redirect_uri=${encodeURIComponent(
      META_CONNECT_CALLBACK_URL
    )}&scope=ads_management,public_profile,email`;
  },

  getMetaLoginUrl() {
    return `https://www.facebook.com/v16.0/dialog/oauth?client_id=${META_CLIENT_ID}&redirect_uri=${encodeURIComponent(
      META_LOGIN_CALLBACK_URL
    )}&scope=openid,email,public_profile`;
  },

  // -------------------
  // Google: Callbacks
  // -------------------
  async handleGoogleConnectCallback(code: string, userId: string) {
    const { tokens } = await googleOauth2Client.getToken({
      code,
      redirect_uri: GOOGLE_CONNECT_CALLBACK_URL,
    });
    googleOauth2Client.setCredentials(tokens);

    const oauth2 = google.oauth2({ auth: googleOauth2Client, version: 'v2' });
    const userInfo = await oauth2.userinfo.get();
    const providerUserId = userInfo.data.id!;

    await prisma.platformConnection.upsert({
      where: {
        platform_userId: { platform: Platform.GOOGLE, userId },
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

    return { message: 'Google account connected successfully' };
  },

  async handleGoogleLoginCallback(code: string) {
    const { tokens } = await googleOauth2Client.getToken({
      code,
      redirect_uri: GOOGLE_LOGIN_CALLBACK_URL,
    });
    googleOauth2Client.setCredentials(tokens);

    const oauth2 = google.oauth2({ auth: googleOauth2Client, version: 'v2' });
    const userInfo = await oauth2.userinfo.get();

    const user = await prisma.user.upsert({
      where: { email: userInfo.data.email! },
      update: {},
      create: { email: userInfo.data.email!, password: '' },
    });

    return getSuccessTokens(user);
  },

  // -------------------
  // Meta: Callbacks
  // -------------------
  async handleMetaConnectCallback(code: string, userId: string) {
    const tokenResp = await axios.get('https://graph.facebook.com/v16.0/oauth/access_token', {
      params: {
        client_id: META_CLIENT_ID,
        redirect_uri: META_CONNECT_CALLBACK_URL,
        client_secret: META_CLIENT_SECRET,
        code,
      },
    });

    const { access_token, expires_in } = tokenResp.data;
    if (!access_token) throw new Error('Failed to obtain access token from Meta');

    const userInfo = await fetchMetaUser(access_token);
    const providerUserId = userInfo.id;

    await prisma.platformConnection.upsert({
      where: { platform_userId: { platform: Platform.META, userId } },
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

    return { message: 'Meta account connected successfully' };
  },

  async handleMetaLoginCallback(code: string) {
    const tokenResp = await axios.get('https://graph.facebook.com/v16.0/oauth/access_token', {
      params: {
        client_id: META_CLIENT_ID,
        redirect_uri: META_LOGIN_CALLBACK_URL,
        client_secret: META_CLIENT_SECRET,
        code,
      },
    });

    const { access_token } = tokenResp.data;
    if (!access_token) throw new Error('Failed to obtain access token from Meta');

    const userInfo = await fetchMetaUser(access_token);
    const user = await prisma.user.upsert({
      where: { email: userInfo.email },
      update: {},
      create: { email: userInfo.email, password: '' },
    });

    return getSuccessTokens(user);
  },
};

// -------------------
// Helper to fetch Meta user info
// -------------------
async function fetchMetaUser(accessToken: string) {
  const response = await axios.get(META_GRAPH_API_URL, {
    params: { fields: 'id,name,email', access_token: accessToken },
  });
  const data = response.data;

  if (!data || !data.email) throw new Error('Email not provided by Meta');
  return { id: data.id, name: data.name, email: data.email };
}
