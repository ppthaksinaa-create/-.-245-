import React, { useState, useMemo } from 'react';
import { RecipientItem, SenderInfo, EducationalCategory } from '../types';
import { PROVINCES_LIST } from '../data/defaultDirectory';
import {
  Search,
  CheckSquare,
  Square,
  Eye,
  Plus,
  Trash2,
  FileSpreadsheet,
  Download,
  Filter,
  Building,
  ArrowUpDown,
  Send,
  UserCheck,
  Check,
} from 'lucide-react';

interface DataTableProps {
  items: RecipientItem[];
  selectedItem: RecipientItem;
  currentSender: SenderInfo;
  onSelectItem: (item: RecipientItem) => void;
  onSetAsSender: (item: RecipientItem) => void;
  onSwapSenderRecipient: () => void;
  onToggleSelect: (id: string) => void;
  onToggleSelectAll: (select: boolean) => void;
  onAddNewItem: (item: RecipientItem) => void;
  onDeleteItem: (id: string) => void;
  onExportCsv: () => void;
  onOpenGoogleSheet: () => void;
}

export const DataTable: React.FC<DataTableProps> = ({
  items,
  selectedItem,
  currentSender,
  onSelectItem,
  onSetAsSender,
  onSwapSenderRecipient,
  onToggleSelect,
  onToggleSelectAll,
  onAddNewItem,
  onDeleteItem,
  onExportCsv,
  onOpenGoogleSheet,
}) => {
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [categoryFilter, setCategoryFilter] = useState<'all' | EducationalCategory | 'selected'>('all');
  const [provinceFilter, setProvinceFilter] = useState<string>('');
  const [isAddingNew, setIsAddingNew] = useState<boolean>(false);
  const [selectionTarget, setSelectionTarget] = useState<'recipient' | 'sender'>('recipient');

  // New item form state
  const [newRecipient, setNewRecipient] = useState<string>('');
  const [newOrg, setNewOrg] = useState<string>('');
  const [newAddress, setNewAddress] = useState<string>('');
  const [newPostal, setNewPostal] = useState<string>('');
  const [newProvince, setNewProvince] = useState<string>('');

  // Counts
  const selectedCount = useMemo(() => items.filter((i) => i.selected).length, [items]);
  const sppCount = useMemo(() => items.filter((i) => i.category === 'spp').length, [items]);
  const spmCount = useMemo(() => items.filter((i) => i.category === 'spm').length, [items]);
  const obecCount = useMemo(() => items.filter((i) => i.category === 'obec').length, [items]);

  // Filtered items
  const filteredItems = useMemo(() => {
    return items.filter((item) => {
      // Category filter
      if (categoryFilter === 'selected' && !item.selected) return false;
      if (categoryFilter === 'spp' && item.category !== 'spp') return false;
      if (categoryFilter === 'spm' && item.category !== 'spm') return false;
      if (categoryFilter === 'obec' && item.category !== 'obec') return false;

      // Province filter
      if (provinceFilter && item.province !== provinceFilter && !item.address.includes(provinceFilter)) {
        return false;
      }

      // Search term
      if (!searchTerm.trim()) return true;
      const term = searchTerm.toLowerCase().trim();
      return (
        item.recipient.toLowerCase().includes(term) ||
        item.organization.toLowerCase().includes(term) ||
        item.address.toLowerCase().includes(term) ||
        item.id.toLowerCase().includes(term) ||
        (item.postalCode && item.postalCode.includes(term)) ||
        (item.province && item.province.includes(term))
      );
    });
  }, [items, categoryFilter, provinceFilter, searchTerm]);

  const handleAddNew = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newRecipient.trim() && !newOrg.trim()) return;

    const newItem: RecipientItem = {
      id: String(Date.now()).slice(-4),
      recipient: newRecipient.trim() || 'ผู้อำนวยการ',
      organization: newOrg.trim(),
      address: newAddress.trim(),
      postalCode: newPostal.trim(),
      province: newProvince.trim(),
      category: 'other',
      selected: true,
    };

    onAddNewItem(newItem);
    onSelectItem(newItem);
    setIsAddingNew(false);

    setNewRecipient('');
    setNewOrg('');
    setNewAddress('');
    setNewPostal('');
    setNewProvince('');
  };

  const handleSelectFiltered = () => {
    filteredItems.forEach((item) => {
      if (!item.selected) onToggleSelect(item.id);
    });
  };

  const handleDeselectFiltered = () => {
    filteredItems.forEach((item) => {
      if (item.selected) onToggleSelect(item.id);
    });
  };

  return (
    <div className="flex flex-col h-full bg-slate-900 border-r border-slate-800">
      {/* Sender Banner: Shows currently selected Sender & Swap Button */}
      <div className="px-4 py-2.5 bg-slate-950 border-b border-slate-800 shrink-0">
        <div className="flex items-center justify-between gap-2">
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-1.5 text-[11px] text-slate-400">
              <span className="w-2 h-2 rounded-full bg-blue-500 shrink-0" />
              <span className="font-semibold text-blue-400">ผู้ส่งปัจจุบัน:</span>
              <span className="text-white font-medium truncate">
                {currentSender.organization || 'ยังไม่ได้ระบุ'}
              </span>
            </div>
            <div className="text-[10px] text-slate-400 truncate mt-0.5">
              {currentSender.address || currentSender.postalCode}
            </div>
          </div>

          <div className="flex items-center gap-1.5 shrink-0">
            {/* Swap Sender and Recipient */}
            <button
              onClick={onSwapSenderRecipient}
              title="สลับผู้ส่งและผู้รับปัจจุบัน (สำหรับทำจดหมายส่งกลับ)"
              className="flex items-center gap-1 px-2.5 py-1 text-xs text-slate-300 bg-slate-900 hover:bg-slate-800 border border-slate-800 rounded-md transition-colors"
            >
              <ArrowUpDown className="w-3.5 h-3.5 text-blue-400" />
              <span>สลับผู้ส่ง-ผู้รับ</span>
            </button>
          </div>
        </div>
      </div>

      {/* Mode Selector: Picking Recipient vs Picking Sender */}
      <div className="p-3 bg-slate-950/60 border-b border-slate-800 space-y-2.5 shrink-0">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center p-0.5 bg-slate-900 border border-slate-800 rounded-lg text-xs w-full">
            <button
              onClick={() => setSelectionTarget('recipient')}
              className={`flex-1 py-1 px-2 rounded-md transition-colors text-center font-medium ${
                selectionTarget === 'recipient'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              คลิกในลิสต์เพื่อเลือก "ผู้รับ"
            </button>
            <button
              onClick={() => setSelectionTarget('sender')}
              className={`flex-1 py-1 px-2 rounded-md transition-colors text-center font-medium ${
                selectionTarget === 'sender'
                  ? 'bg-amber-600 text-white shadow-xs'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              คลิกในลิสต์เพื่อเลือก "ผู้ส่ง"
            </button>
          </div>
        </div>

        {/* Search Input */}
        <div className="flex items-center justify-between gap-2">
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-500" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="ค้นหาชื่อผู้รับ/ผู้ส่ง, สพป., สพม., จังหวัด หรือเลขที่..."
              className="w-full pl-9 pr-3 py-1.5 bg-slate-900 border border-slate-800 rounded-lg text-xs text-white placeholder-slate-500 focus:outline-hidden focus:border-blue-500 transition-colors"
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                className="absolute right-2.5 top-2 text-slate-500 hover:text-white text-xs"
              >
                ✕
              </button>
            )}
          </div>

          <button
            onClick={() => setIsAddingNew(!isAddingNew)}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-200 text-xs font-medium rounded-lg transition-colors shrink-0"
          >
            <Plus className="w-3.5 h-3.5 text-blue-400" />
            <span>เพิ่มใหม่</span>
          </button>
        </div>

        {/* Category Tabs */}
        <div className="flex items-center justify-between gap-2 text-xs">
          <div className="flex items-center gap-1 p-0.5 bg-slate-900 rounded-lg border border-slate-800 overflow-x-auto">
            <button
              onClick={() => setCategoryFilter('all')}
              className={`px-2 py-1 rounded-md transition-colors whitespace-nowrap ${
                categoryFilter === 'all'
                  ? 'bg-blue-600 text-white font-medium'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              ทั้งหมด ({items.length})
            </button>
            <button
              onClick={() => setCategoryFilter('spp')}
              className={`px-2 py-1 rounded-md transition-colors whitespace-nowrap ${
                categoryFilter === 'spp'
                  ? 'bg-blue-600 text-white font-medium'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              สพป. ({sppCount})
            </button>
            <button
              onClick={() => setCategoryFilter('spm')}
              className={`px-2 py-1 rounded-md transition-colors whitespace-nowrap ${
                categoryFilter === 'spm'
                  ? 'bg-blue-600 text-white font-medium'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              สพม. ({spmCount})
            </button>
            <button
              onClick={() => setCategoryFilter('obec')}
              className={`px-2 py-1 rounded-md transition-colors whitespace-nowrap ${
                categoryFilter === 'obec'
                  ? 'bg-blue-600 text-white font-medium'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              สพฐ. ({obecCount})
            </button>
            <button
              onClick={() => setCategoryFilter('selected')}
              className={`px-2 py-1 rounded-md transition-colors whitespace-nowrap ${
                categoryFilter === 'selected'
                  ? 'bg-emerald-600 text-white font-medium'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              ที่เลือก ({selectedCount})
            </button>
          </div>

          <select
            value={provinceFilter}
            onChange={(e) => setProvinceFilter(e.target.value)}
            className="px-2 py-1 bg-slate-900 border border-slate-800 rounded-lg text-xs text-slate-300 focus:outline-hidden max-w-[120px] truncate"
          >
            <option value="">ทุกจังหวัด</option>
            {PROVINCES_LIST.map((p) => (
              <option key={p} value={p}>
                {p}
              </option>
            ))}
          </select>
        </div>

        {/* Selection Bulk Actions */}
        <div className="flex items-center justify-between text-xs text-slate-400 pt-1 border-t border-slate-800/80">
          <div className="flex items-center gap-2">
            <span>แสดง {filteredItems.length} รายการ</span>
            <span className="text-slate-600">·</span>
            <span className="text-emerald-400 font-medium">เลือกพิมพ์ {selectedCount} ซอง</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleSelectFiltered}
              className="hover:text-blue-400 underline transition-colors"
            >
              เลือกทั้งหมด
            </button>
            <span>/</span>
            <button
              onClick={handleDeselectFiltered}
              className="hover:text-red-400 underline transition-colors"
            >
              ยกเลิก
            </button>
          </div>
        </div>
      </div>

      {/* Add New Recipient Form Collapse */}
      {isAddingNew && (
        <form
          onSubmit={handleAddNew}
          className="p-4 bg-slate-950/90 border-b border-slate-800 space-y-2.5 text-xs animate-in slide-in-from-top-2 duration-150"
        >
          <div className="font-semibold text-white flex items-center justify-between">
            <span>เพิ่มรายชื่อผู้รับ/ผู้ส่งใหม่:</span>
            <button
              type="button"
              onClick={() => setIsAddingNew(false)}
              className="text-slate-400 hover:text-white"
            >
              ✕
            </button>
          </div>
          <div>
            <label className="text-slate-400 block mb-0.5">เรียน / ชื่อตำแหน่ง:</label>
            <input
              type="text"
              required
              value={newRecipient}
              onChange={(e) => setNewRecipient(e.target.value)}
              placeholder="เช่น ผู้อำนวยการโรงเรียน..."
              className="w-full px-2.5 py-1.5 bg-slate-900 border border-slate-800 rounded text-white"
            />
          </div>
          <div>
            <label className="text-slate-400 block mb-0.5">หน่วยงาน / โรงเรียน:</label>
            <input
              type="text"
              value={newOrg}
              onChange={(e) => setNewOrg(e.target.value)}
              placeholder="เช่น โรงเรียน..."
              className="w-full px-2.5 py-1.5 bg-slate-900 border border-slate-800 rounded text-white"
            />
          </div>
          <div>
            <label className="text-slate-400 block mb-0.5">ที่อยู่:</label>
            <textarea
              rows={2}
              value={newAddress}
              onChange={(e) => setNewAddress(e.target.value)}
              placeholder="ถนน ตำบล อำเภอ จังหวัด"
              className="w-full px-2.5 py-1.5 bg-slate-900 border border-slate-800 rounded text-white"
            />
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="text-slate-400 block mb-0.5">รหัสไปรษณีย์:</label>
              <input
                type="text"
                maxLength={5}
                value={newPostal}
                onChange={(e) => setNewPostal(e.target.value)}
                placeholder="10300"
                className="w-full px-2.5 py-1.5 bg-slate-900 border border-slate-800 rounded text-white font-mono"
              />
            </div>
            <div>
              <label className="text-slate-400 block mb-0.5">จังหวัด:</label>
              <input
                type="text"
                value={newProvince}
                onChange={(e) => setNewProvince(e.target.value)}
                placeholder="กรุงเทพมหานคร"
                className="w-full px-2.5 py-1.5 bg-slate-900 border border-slate-800 rounded text-white"
              />
            </div>
          </div>
          <div className="flex justify-end gap-2 pt-1">
            <button
              type="button"
              onClick={() => setIsAddingNew(false)}
              className="px-3 py-1 bg-slate-900 hover:bg-slate-800 text-slate-300 rounded"
            >
              ยกเลิก
            </button>
            <button
              type="submit"
              className="px-3 py-1 bg-blue-600 hover:bg-blue-500 text-white rounded font-medium"
            >
              บันทึก
            </button>
          </div>
        </form>
      )}

      {/* Recipient / Sender Rows List */}
      <div className="flex-1 overflow-y-auto divide-y divide-slate-800/60">
        {filteredItems.length === 0 ? (
          <div className="p-8 text-center text-xs text-slate-500 space-y-2">
            <div>ไม่พบรายการที่ตรงกับคำค้นหา</div>
            <button
              onClick={() => {
                setSearchTerm('');
                setCategoryFilter('all');
                setProvinceFilter('');
              }}
              className="text-blue-400 hover:underline"
            >
              ล้างตัวกรองทั้งหมด
            </button>
          </div>
        ) : (
          filteredItems.map((item) => {
            const isCurrentRecipient = selectedItem?.id === item.id;
            const isCurrentSender = currentSender.id === item.id || currentSender.organization === item.organization;

            const handleRowClick = () => {
              if (selectionTarget === 'sender') {
                onSetAsSender(item);
              } else {
                onSelectItem(item);
              }
            };

            return (
              <div
                key={item.id}
                onClick={handleRowClick}
                className={`group flex items-start gap-3 p-3 transition-colors cursor-pointer text-xs ${
                  isCurrentRecipient
                    ? 'bg-blue-950/40 border-l-2 border-blue-500'
                    : isCurrentSender
                    ? 'bg-amber-950/30 border-l-2 border-amber-500'
                    : 'hover:bg-slate-800/40'
                }`}
              >
                {/* Checkbox for batch print selection */}
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    onToggleSelect(item.id);
                  }}
                  className="mt-0.5 text-slate-400 hover:text-white"
                >
                  {item.selected ? (
                    <CheckSquare className="w-4 h-4 text-emerald-400" />
                  ) : (
                    <Square className="w-4 h-4 text-slate-600 group-hover:text-slate-400" />
                  )}
                </button>

                {/* Main item details */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5 mb-0.5 flex-wrap">
                    <span className="font-mono text-[10px] text-slate-500 tabular-nums">
                      #{item.id}
                    </span>
                    <span className="font-semibold text-slate-100 truncate">
                      {item.organization || item.recipient}
                    </span>

                    {/* Sender badge if this item is currently sender */}
                    {isCurrentSender && (
                      <span className="text-[10px] bg-amber-500/20 text-amber-300 border border-amber-500/40 rounded px-1 py-0.2 font-medium">
                        ผู้ส่ง
                      </span>
                    )}

                    {/* Recipient badge if currently viewed */}
                    {isCurrentRecipient && (
                      <span className="text-[10px] bg-blue-500/20 text-blue-300 border border-blue-500/40 rounded px-1 py-0.2 font-medium">
                        ผู้รับที่เปิดดู
                      </span>
                    )}
                  </div>

                  <div className="text-slate-300 truncate font-sarabun text-sm">
                    <span className="text-slate-500 mr-1">เรียน</span>
                    {item.recipient}
                  </div>

                  <div className="text-slate-400 line-clamp-1 text-[11px] mt-0.5">
                    {item.address.replace(/\n/g, ' ')}
                  </div>

                  {item.postalCode && (
                    <div className="text-[10px] text-slate-500 font-mono mt-1">
                      ปณ. {item.postalCode}
                      {item.province ? ` · ${item.province}` : ''}
                    </div>
                  )}

                  {/* Quick Action Buttons per Row */}
                  <div className="flex items-center gap-2 mt-2 pt-1 border-t border-slate-800/60 opacity-90">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        onSetAsSender(item);
                      }}
                      className={`flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-medium transition-colors ${
                        isCurrentSender
                          ? 'bg-amber-600 text-white'
                          : 'bg-slate-800 hover:bg-slate-700 text-amber-300 border border-amber-500/30'
                      }`}
                    >
                      <UserCheck className="w-3 h-3" />
                      <span>{isCurrentSender ? 'เป็นผู้ส่งอยู่' : 'เลือกเป็นผู้ส่ง'}</span>
                    </button>

                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        onSelectItem(item);
                      }}
                      className={`flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-medium transition-colors ${
                        isCurrentRecipient
                          ? 'bg-blue-600 text-white'
                          : 'bg-slate-800 hover:bg-slate-700 text-blue-300 border border-blue-500/30'
                      }`}
                    >
                      <Eye className="w-3 h-3" />
                      <span>{isCurrentRecipient ? 'กำลังดูซอง' : 'เลือกเป็นผู้รับ'}</span>
                    </button>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Bottom Quick Tools */}
      <div className="p-3 bg-slate-950 border-t border-slate-800 flex items-center justify-between gap-2 shrink-0 text-xs">
        <button
          onClick={onOpenGoogleSheet}
          className="flex items-center gap-1.5 px-2.5 py-1.5 bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 rounded-lg transition-colors"
          title="ดึงข้อมูลจาก Google Sheet / ฐานข้อมูล"
        >
          <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-400" />
          <span>Google Sheet</span>
        </button>

        <button
          onClick={onExportCsv}
          className="flex items-center gap-1.5 px-2.5 py-1.5 bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 rounded-lg transition-colors"
          title="ส่งออกรายชื่อเป็นไฟล์ CSV"
        >
          <Download className="w-3.5 h-3.5 text-blue-400" />
          <span>ส่งออก CSV</span>
        </button>
      </div>
    </div>
  );
};
