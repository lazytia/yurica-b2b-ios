import React, { useEffect, useState, useCallback } from 'react';
import { SafeAreaView, View, Text, FlatList, RefreshControl, ActivityIndicator, StyleSheet } from 'react-native';
import { fetchMenu } from '../api/client';

export default function MenuScreen() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');

  const load = useCallback(async () => {
    setLoading(true); setError('');
    try {
      const data = await fetchMenu();
      setItems(Array.isArray(data) ? data : []);
    } catch (e) {
      setError('메뉴를 불러오지 못했어요. 서버/네트워크를 확인해주세요.');
    } finally {
      setLoading(false);
    }
  }, []);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await load();
    setRefreshing(false);
  }, [load]);

  useEffect(() => { load(); }, [load]);

  return (
    <SafeAreaView style={s.container}>
      <View style={s.header}><Text style={s.title}>Yurica Menu</Text></View>

      {loading ? (
        <View style={s.center}><ActivityIndicator size="large" /><Text>불러오는 중…</Text></View>
      ) : error ? (
        <View style={s.center}><Text style={s.error}>{error}</Text></View>
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
                {(item.price_cents/100).toFixed(2)} {item.currency || 'AUD'}
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
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  error: { color: 'red' },
  card: { backgroundColor: '#fafafa', padding: 12, borderRadius: 12, marginBottom: 12, borderWidth: 1, borderColor: '#eee' },
  name: { fontSize: 16, fontWeight: '700' },
  desc: { fontSize: 14, color: '#555', marginTop: 4 },
  meta: { fontSize: 12, color: '#666', marginTop: 6 }
});
