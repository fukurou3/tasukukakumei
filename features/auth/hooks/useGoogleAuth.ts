// features/auth/hooks/useGoogleAuth.ts
import { useState, useEffect } from 'react';
import * as WebBrowser from 'expo-web-browser';
import * as Google from 'expo-auth-session/providers/google';
import * as SecureStore from 'expo-secure-store';

// Webブラウザの結果をAuthSessionが処理できるようにします
WebBrowser.maybeCompleteAuthSession();

const GOOGLE_AUTH_KEY = 'googleAuth';

type AuthState = {
  accessToken: string;
  refreshToken: string | null;
  idToken: string | null;
}

export const useGoogleAuth = () => {
  const [auth, setAuth] = useState<AuthState | null>(null);
  const [user, setUser] = useState<any>(null);
  const [isSigningIn, setIsSigningIn] = useState(false);

  const [request, response, promptAsync] = Google.useAuthRequest({
    androidClientId: process.env.EXPO_PUBLIC_ANDROID_CLIENT_ID,
    iosClientId: process.env.EXPO_PUBLIC_IOS_CLIENT_ID,
    scopes: ['https://www.googleapis.com/auth/calendar'],
  });

  useEffect(() => {
    // 保存された認証情報を読み込む
    const loadAuth = async () => {
      const storedAuth = await SecureStore.getItemAsync(GOOGLE_AUTH_KEY);
      if (storedAuth) {
        const parsedAuth = JSON.parse(storedAuth);
        setAuth(parsedAuth);
      }
    };
    loadAuth();
  }, []);

  useEffect(() => {
    const handleResponse = async () => {
      if (response?.type === 'success') {
        const { authentication } = response;
        if (authentication) {
          setAuth({
            accessToken: authentication.accessToken,
            refreshToken: authentication.refreshToken || null,
            idToken: authentication.idToken,
          });

          // 認証情報をセキュアに保存
          await SecureStore.setItemAsync(
            GOOGLE_AUTH_KEY,
            JSON.stringify({
              accessToken: authentication.accessToken,
              refreshToken: authentication.refreshToken,
              idToken: authentication.idToken,
            })
          );
        }
      }
    };
    handleResponse();
  }, [response]);

  useEffect(() => {
    // アクセストークンを使ってユーザー情報を取得
    const fetchUserInfo = async () => {
      if (auth) {
        try {
            const res = await fetch('https://www.googleapis.com/userinfo/v2/me', {
                headers: { Authorization: `Bearer ${auth.accessToken}` },
            });
            const userInfo = await res.json();
            setUser(userInfo);
        } catch (error) {
            // TODO: トークンリフレッシュのロジックをここに追加する
            console.error("Failed to fetch user info", error);
            signOut(); // フェッチに失敗したら一旦サインアウト
        }
      }
    };
    fetchUserInfo();
  }, [auth]);

  const signOut = async () => {
    await SecureStore.deleteItemAsync(GOOGLE_AUTH_KEY);
    setAuth(null);
    setUser(null);
  };

  const signIn = async () => {
    setIsSigningIn(true);
    try {
      await promptAsync();
    } finally {
      setIsSigningIn(false);
    }
  };

  return {
    user,
    isSignedIn: !!auth,
    signIn,
    signOut,
    isSigningIn,
  };
};