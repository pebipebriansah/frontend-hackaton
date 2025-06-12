import React, { useEffect, useState } from 'react';
import { usePathname, useRouter } from 'expo-router';
import { View, Text, Pressable } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import PropTypes from 'prop-types';
import AsyncStorage from '@react-native-async-storage/async-storage';

const Layout = ({ children }) => {
  const pathname = usePathname();
  const router = useRouter();
  const [user, setUser] = useState(null);

  const isLoginOrRegister = pathname === '/login' || pathname === '/register';

  useEffect(() => {
    const fetchUser = async () => {
      const token = await AsyncStorage.getItem('token');
      if (!token) {
        if (!isLoginOrRegister) router.replace('/login');
        return;
      }

      try {
        const res = await fetch('https://backendpetani-h5hwb3dzaydhcbgr.eastasia-01.azurewebsites.net/petani/me', {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!res.ok) throw new Error('Token tidak valid');
        const data = await res.json();
        setUser(data);
      } catch (err) {
        await AsyncStorage.removeItem('token');
        setUser(err);
        if (!isLoginOrRegister) router.replace('/login');
      }
    };

    fetchUser();
  }, [pathname]);

  const logout = async () => {
    await AsyncStorage.removeItem('token');
    router.replace('/login');
  };

  if (isLoginOrRegister) {
    return (
      <View style={{ flex: 1 }}>
        <StatusBar style="auto" />
        {children}
      </View>
    );
  }

  return (
    <View style={{ flex: 1 }}>
      <StatusBar style="auto" />
      <View style={{ padding: 16, backgroundColor: '#ffffff' }}>
        <Text style={{ fontSize: 18, marginBottom: 8 }}>
          Halo, {user ? user.nama_petani : '...'}
        </Text>

        <View style={{ flexDirection: 'row', marginBottom: 8 }}>
          <Pressable onPress={() => router.push('/dashboard')} style={{ backgroundColor: '#3182ce', padding: 8, borderRadius: 6, marginRight: 8 }}>
            <Text style={{ color: '#fff' }}>Dashboard</Text>
          </Pressable>
          <Pressable onPress={() => router.push('/deteksi')} style={{ backgroundColor: '#38a169', padding: 8, borderRadius: 6, marginRight: 8 }}>
            <Text style={{ color: '#fff' }}>Deteksi</Text>
          </Pressable>
          <Pressable onPress={() => router.push('/harga')} style={{ backgroundColor: '#805ad5', padding: 8, borderRadius: 6 }}>
            <Text style={{ color: '#fff' }}>Harga</Text>
          </Pressable>
        </View>

        <Pressable
          onPress={logout}
          style={{
            backgroundColor: '#e53e3e',
            paddingVertical: 8,
            paddingHorizontal: 16,
            borderRadius: 8,
            alignSelf: 'flex-start',
          }}
        >
          <Text style={{ color: '#ffffff', fontWeight: 'bold' }}>Keluar</Text>
        </Pressable>
      </View>

      <View style={{ flex: 1, padding: 16 }}>{children}</View>
    </View>
  );
};

Layout.propTypes = {
  children: PropTypes.node.isRequired,
};

export default Layout;
