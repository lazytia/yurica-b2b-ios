// 서버(Express)가 돌아가는 PC의 IP로 바꿔주세요!
// Win에서 ipconfig로 IPv4 확인. 예: 192.168.0.12
export const API_BASE = 'http://192.168.0.4:4000';

export async function fetchMenu() {
  const res = await fetch(`${API_BASE}/api/menu`, { method: 'GET' });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.json();
}
