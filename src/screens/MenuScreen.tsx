import React, { useEffect, useState, useCallback } from 'react';
import { SafeAreaView, View, Text, FlatList, RefreshControl, ActivityIndicator, StyleSheet, Button, AppState } from 'react-native';
import { API_BASE, fetchMenu } from '../api/client';

function fetchWithTimeout(url, opts = {}, timeout = 7000) {
  return new Promise((resolve, reject) => {
    const id = setTimeout(() => reject(new Error(`timeout ${timeout}ms: ${url}`)), timeout);
    fetch(url, opts)
      .then(res => { clearTimeout(id); resolve(res); })
      .catch(err => { clearTimeout(id); reject(err); });
  });
}

export default function MenuScreen() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const url = `${API_BASE}/api/menu?t=${Date.now()}`;
      const res = await fetchWithTimeout(url, { method: 'GET', cache: 'no-store' }, 7000);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      setItems(Array.isArray(data) ? data : []);
    } catch (e) {
      setError(String(e?.message || e));
    } finally {
      setLoading(false);
    }
  }, []);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await load();
    setRefreshing(false);
  }, [load]);

  // 앱이 다시 포그라운드로 돌아올 때 자동 새로고침
  useEffect(() => {
    const sub = AppState.addEventListener('change', (state) => {
      if (state === 'active') load();
    });
    return () => sub.remove();
  }, [load]);

  // 주기적 자동 새로고침 (15초마다)
  useEffect(() => {
    const id = setInterval(() => { load(); }, 15000);
    return () => clearInterval(id);
  }, [load]);

  useEffect(() => { load(); }, [load]);

  return (
    <SafeAreaView style={s.container}>
      <View style={s.header}>
        <Text style={s.title}>Yurica Menu</Text>
        <Text style={s.endpoint}>{API_BASE}</Text>

        <View style={{ flexDirection: 'row', gap: 8, marginTop: 8 }}>
          {/* 웹으로 보내기 */}
          <Button title="웹으로 보내기" onPress={async () => {
            try {
              const res = // 웹으로 보내기
await fetch(`${API_BASE}/api/events`, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    type: 'order',
    orderId: 'O-' + Date.now(),
    table: '3',
    items: ['Salmon Sashimi', 'Udon'],
    note: 'Less salt',
    companyName: 'Yurica Pty',
    customerName: 'Tia',
    deviceId: 'iphone'
  })
});
              if (!res.ok) throw new Error(`HTTP ${res.status}`);
            } catch (e) {
              console.log('send failed', e);
            }
          }} />

          {/* 새로고침 */}
          <Button title="새로고침" onPress={load} />
        </View>
      </View>

      {loading ? (
        <View style={s.center}>
          <ActivityIndicator size="large" />
          <Text>불러오는 중…</Text>
        </View>
      ) : error ? (
        <View style={s.center}>
          <Text style={s.error}>{error}</Text>
        </View>
      ) : (
        <FlatList
          data={items}
          keyExtractor={(item) => item.id}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
          contentContainerStyle={{ padding: 12 }}
          renderItem={({ item }) => (
            <View style={s.card}>
              <Text style={s.name}>{item.name}</Text>
              {!!item.description && <Text style={s.desc}>{item.description}</Text>}
              <Text style={s.meta}>
                {(item.price_cents / 100).toFixed(2)} {item.currency || 'AUD'}
              </Text>
            </View>
          )}
          ListEmptyComponent={<View style={s.center}><Text>메뉴가 없습니다.</Text></View>}
        />
      )}
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  header: { padding: 16, alignItems: 'center', borderBottomWidth: 1, borderColor: '#eee' },
  title: { fontSize: 20, fontWeight: '700' },
  endpoint: { marginTop: 4, fontSize: 12, color: '#666' },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  error: { color: 'red', paddingHorizontal: 16, textAlign: 'center' },
  card: { backgroundColor: '#fafafa', padding: 12, borderRadius: 12, marginBottom: 12, borderWidth: 1, borderColor: '#eee' },
  name: { fontSize: 16, fontWeight: '700' },
  desc: { fontSize: 14, color: '#555', marginTop: 4 },
  meta: { fontSize: 12, color: '#666', marginTop: 6 }
});
