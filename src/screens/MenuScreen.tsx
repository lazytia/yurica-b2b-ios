// src/screens/MenuScreen.tsx
import React, { useEffect, useMemo, useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, FlatList, SafeAreaView, ActivityIndicator, Alert } from 'react-native';
import { supabase } from '../../lib/supabaseClient';

type Item = {
  id: string;
  name: string;
  price: number;
  category: 'Mains' | 'Sushi' | 'Donburi' | 'Sides' | 'Drinks';
  image_url?: string;
};

export default function MenuScreen({ staffName = 'User' }: { staffName?: string }) {
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState<Item['category'] | 'All'>('All');
  const [menus, setMenus] = useState<Item[]>([]);
  const [loading, setLoading] = useState(true);
  const [cart, setCart] = useState<Record<string, number>>({});

  // ✅ Supabase에서 메뉴 가져오기
  useEffect(() => {
    const fetchMenus = async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from('menus')
        .select('*')
        .eq('is_available', true)
        .order('category', { ascending: true });

      if (error) {
        Alert.alert('Error', error.message);
      } else {
        setMenus(data as Item[]);
      }
      setLoading(false);
    };

    fetchMenus();
  }, []);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return menus.filter((it) => {
      const okCat = category === 'All' ? true : it.category === category;
      const okQ = q.length === 0 ? true : it.name.toLowerCase().includes(q);
      return okCat && okQ;
    });
  }, [query, category, menus]);

  const add = (id: string) => setCart((p) => ({ ...p, [id]: (p[id] ?? 0) + 1 }));
  const dec = (id: string) => setCart((p) => {
    const n = { ...p };
    const v = (n[id] ?? 0) - 1;
    if (v <= 0) delete n[id];
    else n[id] = v;
    return n;
  });
  const qty = (id: string) => cart[id] ?? 0;

  const total = useMemo(
    () => Object.entries(cart).reduce((sum, [id, qty]) => {
      const item = menus.find((i) => i.id === id);
      return sum + (item ? item.price * qty : 0);
    }, 0),
    [cart, menus]
  );

  const submit = () => {
    if (Object.keys(cart).length === 0) return Alert.alert('Cart is empty', 'Please add menu items.');
    Alert.alert('Order sent ✅', `Total: $${total.toFixed(2)}\nStaff: ${staffName}`);
    setCart({});
  };

  const CATEGORIES: Item['category'][] = ['Mains', 'Sushi', 'Donburi', 'Sides', 'Drinks'];

  if (loading) {
    return (
      <SafeAreaView style={styles.loadingScreen}>
        <ActivityIndicator size="large" color="#3478F6" />
        <Text style={styles.loadingText}>Loading menu…</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.header}>
        <Text style={styles.title}>Yurica Menu</Text>
        <Text style={styles.subtitle}>Staff: {staffName}</Text>
      </View>

      <TextInput
        style={styles.search}
        placeholder="Search menu…"
        placeholderTextColor="rgba(255,255,255,0.5)"
        value={query}
        onChangeText={setQuery}
      />

      <View style={styles.catRow}>
        <TouchableOpacity onPress={() => setCategory('All')}>
          <Text style={[styles.catText, category === 'All' && styles.catTextActive]}>All</Text>
        </TouchableOpacity>
        {CATEGORIES.map((c) => (
          <TouchableOpacity key={c} onPress={() => setCategory(c)}>
            <Text style={[styles.catText, category === c && styles.catTextActive]}>{c}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <FlatList
        data={filtered}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ padding: 16 }}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <Text style={styles.itemName}>{item.name}</Text>
            <Text style={styles.itemPrice}>${item.price.toFixed(2)}</Text>
            <View style={styles.actions}>
              {qty(item.id) > 0 ? (
                <>
                  <TouchableOpacity onPress={() => dec(item.id)}><Text style={styles.actionBtn}>–</Text></TouchableOpacity>
                  <Text style={styles.qtyText}>{qty(item.id)}</Text>
                  <TouchableOpacity onPress={() => add(item.id)}><Text style={styles.actionBtn}>＋</Text></TouchableOpacity>
                </>
              ) : (
                <TouchableOpacity onPress={() => add(item.id)}><Text style={styles.addText}>Add</Text></TouchableOpacity>
              )}
            </View>
          </View>
        )}
      />

      <View style={styles.cartBar}>
        <Text style={styles.totalText}>Total: ${total.toFixed(2)}</Text>
        <TouchableOpacity style={styles.orderBtn} onPress={submit}>
          <Text style={styles.orderText}>Send Order</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#0b1220' },
  loadingScreen: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: '#0b1220' },
  loadingText: { color: '#fff', marginTop: 12 },
  header: { padding: 16 },
  title: { color: '#fff', fontSize: 22, fontWeight: '800' },
  subtitle: { color: 'rgba(255,255,255,0.7)', marginTop: 4 },
  search: { marginHorizontal: 16, marginBottom: 8, padding: 10, borderRadius: 8, backgroundColor: 'rgba(255,255,255,0.1)', color: '#fff' },
  catRow: { flexDirection: 'row', justifyContent: 'space-around', marginBottom: 12 },
  catText: { color: 'rgba(255,255,255,0.6)', fontSize: 14 },
  catTextActive: { color: '#fff', fontWeight: '700', textDecorationLine: 'underline' },
  card: { backgroundColor: '#101828', marginBottom: 10, borderRadius: 12, padding: 12 },
  itemName: { color: '#fff', fontSize: 16, fontWeight: '700' },
  itemPrice: { color: 'rgba(255,255,255,0.7)', marginTop: 4 },
  actions: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 10 },
  addText: { color: '#33C17D', fontWeight: '700', fontSize: 16 },
  actionBtn: { color: '#fff', fontSize: 20, width: 30, textAlign: 'center' },
  qtyText: { color: '#fff', fontSize: 16 },
  cartBar: { backgroundColor: '#101828', padding: 12, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  totalText: { color: '#fff', fontSize: 16 },
  orderBtn: { backgroundColor: '#33C17D', paddingHorizontal: 16, paddingVertical: 10, borderRadius: 10 },
  orderText: { color: '#fff', fontWeight: '700' },
});
