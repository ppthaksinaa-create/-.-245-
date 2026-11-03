import { RecipientItem } from '../types';
import rawData from './defaultData.json';

export const DEFAULT_DIRECTORY: RecipientItem[] = (rawData as any[]).map((item) => ({
  id: String(item.id),
  recipient: item.recipient || '',
  organization: item.organization || '',
  address: item.address || '',
  postalCode: item.postalCode || '',
  province: item.province || '',
  category: (item.category as any) || 'spp',
  selected: false,
}));

export const DEFAULT_SENDER = {
  title: 'ผู้ส่ง',
  organization: 'สำนักงานเขตพื้นที่การศึกษา',
  address: 'กลุ่มบริหารงานทั่วไป ถนนราชดำเนิน แขวงดุสิต เขตดุสิต',
  postalCode: '10300',
  phone: 'โทร. 0 2280 5555',
  department: 'กลุ่มอำนวยการ / งานสารบรรณ',
};

export const PROVINCES_LIST = Array.from(
  new Set(
    DEFAULT_DIRECTORY.map((item) => item.province).filter((p): p is string => Boolean(p))
  )
).sort((a, b) => a.localeCompare(b, 'th'));
