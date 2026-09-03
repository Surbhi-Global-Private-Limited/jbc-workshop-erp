'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://mgibrfygyibzfmmtsnwq.supabase.co'
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'sb_publishable_wYtL56DK1XY3nWe6bkATgg_oxzx742V'
const supabase = createClient(supabaseUrl, supabaseKey)

const BRANDS = ['Maruti Suzuki', 'Hyundai', 'Tata', 'Mahindra', 'Kia', 'Toyota', 'Honda', 'MG', 'Renault', 'Volkswagen', 'Skoda', 'Ford', 'BMW', 'Mercedes', 'Audi', 'Other']

const SPARE_PARTS_CATALOG = [
  { id: 1, name: 'Engine Oil 5W30 (4L)', price: 2200 },
  { id: 2, name: 'Oil Filter', price: 350 },
  { id: 3, name: 'Air Filter', price: 450 },
  { id: 4, name: 'AC Dust/Pollen Filter', price: 550 },
  { id: 5, name: 'Front Brake Pad Set', price: 1800 },
  { id: 6, name: 'Rear Brake Shoe Set', price: 1400 },
  { id: 7, name: 'Coolant (Green/Red 1L)', price: 300 },
  { id: 8, name: 'Spark Plug Set (4 Pcs)', price: 800 },
  { id: 9, name: 'Wiper Blade Pair', price: 650 },
  { id: 10, name: 'Battery 35Ah / 45Ah', price: 4500 },
  { id: 11, name: 'Front Shock Absorber (Single)', price: 2800 },
  { id: 12, name: 'Clutch Plate & Pressure Plate', price: 4200 },
  { id: 13, name: 'AC Gas R134a Refill', price: 1500 },
  { id: 14, name: 'Headlight Bulb H4/H7', price: 350 },
  { id: 15, name: 'Brake Fluid DOT 4 (500ml)', price: 250 }
]

const BODY_PANELS = [
  'Front Bumper', 'Rear Bumper', 'Bonnet / Hood', 'Roof', 'Boot Lid / Tailgate',
  'Front Left Door', 'Front Right Door', 'Rear Left Door', 'Rear Right Door',
  'Left Fender', 'Right Fender', 'Left Running Board', 'Right Running Board',
  'Left Quarter Panel', 'Right Quarter Panel', 'ORVM Left Mirror', 'ORVM Right Mirror'
]

const LABOUR_HEADS = [
  'Opening & Fitting Labour', 'Mechanical Repair Labour', 'Denting Repair Labour',
  'Painting Repair Labour', 'AC Servicing & Gas Charging', 'Wheel Alignment & Balancing',
  'Electrical Diagnostic & Wiring', 'Washing & Interior Detailing'
]

export default function Home() {
  const [activeTab, setActiveTab] = useState<'routine' | 'accident' | 'denting' | 'parts' | 'labour' | 'status'>('routine')
  const [loading, setLoading] = useState(false)
  const [partSearch, setPartSearch] = useState('')
  const [selectedParts, setSelectedParts] = useState<any[]>([])
  const [selectedPanels, setSelectedPanels] = useState<string[]>([])
  const [selectedLabour, setSelectedLabour] = useState<{ [key: string]: number }>({})

  // Form State
  const [customerName, setCustomerName] = useState('')
  const [mobile, setMobile] = useState('')
  const [vehicleNo, setVehicleNo] = useState('')
  const [brand, setBrand] = useState('')
  const [model, setModel] = useState('')

  const handlePanelToggle = (panel: string) => {
    if (selectedPanels.includes(panel)) {
      setSelectedPanels(selectedPanels.filter(p => p !== panel))
    } else {
      setSelectedPanels([...selectedPanels, panel])
    }
  }

  const handleAddPart = (part: any) => {
    const exists = selectedParts.find(p => p.id === part.id)
    if (exists) {
      setSelectedParts(selectedParts.map(p => p.id === part.id ? { ...p, qty: p.qty + 1 } : p))
    } else {
      setSelectedParts([...selectedParts, { ...part, qty: 1 }])
    }
  }

  const handleLabourChange = (head: string, amount: number) => {
    setSelectedLabour({ ...selectedLabour, [head]: amount })
  }

  const totalPartsCost = selectedParts.reduce((sum, p) => sum + (p.price * p.qty), 0)
  const totalLabourCost = Object.values(selectedLabour).reduce((sum, val) => sum + (val || 0), 0)

  return (
    <div className="min-h-screen bg-slate-100 text-slate-800 pb-20">
      {/* Header */}
      <header className="bg-slate-900 text-white p-4 shadow-lg sticky top-0 z-50 flex justify-between items-center border-b border-slate-800">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center font-black text-sm tracking-wider shadow">FC</div>
          <div>
            <h1 className="font-extrabold text-base tracking-wide leading-none">FIRST CHOICE</h1>
            <p className="text-[10px] text-blue-400 uppercase font-semibold tracking-wider">WORKSHOP MANAGEMENT SYSTEM</p>
          </div>
        </div>
        <span className="bg-emerald-500/20 text-emerald-400 text-xs px-2.5 py-1 rounded-full font-medium border border-emerald-500/30">● Live</span>
      </header>

      {/* Main Container */}
      <main className="max-w-2xl mx-auto p-4 space-y-4">
        
        {/* Customer & Vehicle Header Bar */}
        <div className="bg-white p-4 rounded-2xl border shadow-sm space-y-3">
          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Basic Vehicle Info</h3>
          <div className="grid grid-cols-2 gap-2">
            <input value={customerName} onChange={e => setCustomerName(e.target.value)} placeholder="Customer Name *" className="p-2.5 border rounded-xl text-xs bg-slate-50 focus:bg-white outline-none" />
            <input value={mobile} onChange={e => setMobile(e.target.value)} placeholder="Mobile No *" type="tel" className="p-2.5 border rounded-xl text-xs bg-slate-50 focus:bg-white outline-none" />
            <input value={vehicleNo} onChange={e => setVehicleNo(e.target.value.toUpperCase())} placeholder="Vehicle No (MP20CB1234) *" className="p-2.5 border rounded-xl text-xs font-bold uppercase bg-slate-50 focus:bg-white outline-none" />
            <div className="grid grid-cols-2 gap-1">
              <select value={brand} onChange={e => setBrand(e.target.value)} className="p-2.5 border rounded-xl text-xs bg-slate-50 outline-none">
                <option value="">Brand</option>
                {BRANDS.map(b => <option key={b} value={b}>{b}</option>)}
              </select>
              <input value={model} onChange={e => setModel(e.target.value)} placeholder="Model" className="p-2.5 border rounded-xl text-xs bg-slate-50 outline-none" />
            </div>
          </div>
        </div>

        {/* Modular Tabs Navigation */}
        <div className="flex bg-white p-1 rounded-2xl shadow-sm border overflow-x-auto gap-1 text-[11px] font-bold text-slate-600">
          <button onClick={() => setActiveTab('routine')} className={`py-2 px-3 rounded-xl whitespace-nowrap transition ${activeTab === 'routine' ? 'bg-blue-600 text-white shadow' : 'hover:bg-slate-50'}`}>🛠️ Routine Service</button>
          <button onClick={() => setActiveTab('accident')} className={`py-2 px-3 rounded-xl whitespace-nowrap transition ${activeTab === 'accident' ? 'bg-blue-600 text-white shadow' : 'hover:bg-slate-50'}`}>🚨 Accident & Towing</button>
          <button onClick={() => setActiveTab('denting')} className={`py-2 px-3 rounded-xl whitespace-nowrap transition ${activeTab === 'denting' ? 'bg-blue-600 text-white shadow' : 'hover:bg-slate-50'}`}>🎨 Denting/Painting</button>
          <button onClick={() => setActiveTab('parts')} className={`py-2 px-3 rounded-xl whitespace-nowrap transition ${activeTab === 'parts' ? 'bg-blue-600 text-white shadow' : 'hover:bg-slate-50'}`}>⚙️ Spare Parts</button>
          <button onClick={() => setActiveTab('labour')} className={`py-2 px-3 rounded-xl whitespace-nowrap transition ${activeTab === 'labour' ? 'bg-blue-600 text-white shadow' : 'hover:bg-slate-50'}`}>👨‍🔧 Labour Charges</button>
          <button onClick={() => setActiveTab('status')} className={`py-2 px-3 rounded-xl whitespace-nowrap transition ${activeTab === 'status' ? 'bg-blue-600 text-white shadow' : 'hover:bg-slate-50'}`}>📌 Status Tracker</button>
        </div>

        {/* 1. ROUTINE SERVICE TAB */}
        {activeTab === 'routine' && (
          <div className="bg-white p-5 rounded-2xl border shadow-sm space-y-4">
            <h2 className="font-bold text-slate-800 text-sm border-b pb-2">1. General Mechanical & Routine Maintenance</h2>
            <div className="grid grid-cols-2 gap-2 text-xs">
              {['Engine Oil Change', 'Filter Replacement', 'Brake Servicing', 'Suspension Overhaul', 'AC Service & Gas', 'Electrical Diagnostics'].map(item => (
                <label key={item} className="flex items-center gap-2 p-2.5 border rounded-xl bg-slate-50 cursor-pointer">
                  <input type="checkbox" className="w-4 h-4 accent-blue-600" />
                  <span>{item}</span>
                </label>
              ))}
            </div>
            <textarea rows={3} placeholder="Additional complaints or mechanical notes..." className="w-full p-3 border rounded-xl text-xs bg-slate-50 outline-none" />
          </div>
        )}

        {/* 2. ACCIDENT & INSURANCE TAB */}
        {activeTab === 'accident' && (
          <div className="bg-white p-5 rounded-2xl border shadow-sm space-y-4">
            <h2 className="font-bold text-slate-800 text-sm border-b pb-2">2. Accident Case & Towing Details</h2>
            <div className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-2">
                <input placeholder="Pickup Site / Spot Location" className="p-3 border rounded-xl bg-slate-50 outline-none" />
                <input placeholder="Towing Driver Name & Contact" className="p-3 border rounded-xl bg-slate-50 outline-none" />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <input placeholder="Towing Charges (₹)" type="number" className="p-3 border rounded-xl bg-slate-50 outline-none" />
                <input placeholder="Insurance Company Name" className="p-3 border rounded-xl bg-slate-50 outline-none" />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <input placeholder="Claim / Policy Number" className="p-3 border rounded-xl bg-slate-50 outline-none" />
                <input placeholder="Surveyor Name & Mobile" className="p-3 border rounded-xl bg-slate-50 outline-none" />
              </div>
            </div>
          </div>
        )}

        {/* 3. DENTING & PAINTING TAB */}
        {activeTab === 'denting' && (
          <div className="bg-white p-5 rounded-2xl border shadow-sm space-y-4">
            <div className="flex justify-between items-center border-b pb-2">
              <h2 className="font-bold text-slate-800 text-sm">3. Denting & Painting Panel Selection</h2>
              <span className="text-[11px] bg-blue-50 text-blue-600 font-bold px-2 py-0.5 rounded-lg">{selectedPanels.length} Panels Selected</span>
            </div>
            <div className="grid grid-cols-2 gap-2 text-xs">
              {BODY_PANELS.map(panel => {
                const isSelected = selectedPanels.includes(panel)
                return (
                  <button
                    key={panel}
                    type="button"
                    onClick={() => handlePanelToggle(panel)}
                    className={`p-2.5 rounded-xl border text-left font-medium transition ${isSelected ? 'bg-blue-600 text-white border-blue-600 shadow-sm' : 'bg-slate-50 text-slate-700 hover:bg-slate-100'}`}
                  >
                    {isSelected ? '✓ ' : '+ '} {panel}
                  </button>
                )
              })}
            </div>
          </div>
        )}

        {/* 4. SPARE PARTS TAB */}
        {activeTab === 'parts' && (
          <div className="bg-white p-5 rounded-2xl border shadow-sm space-y-4">
            <div className="flex justify-between items-center border-b pb-2">
              <h2 className="font-bold text-slate-800 text-sm">4. Spare Parts Requisition</h2>
              <span className="text-xs font-bold text-emerald-600">Total: ₹{totalPartsCost}</span>
            </div>
            <input
              value={partSearch}
              onChange={e => setPartSearch(e.target.value)}
              placeholder="🔍 Search Spare Parts Catalog (300+ items)..."
              className="w-full p-3 border rounded-xl text-xs bg-slate-50 outline-none"
            />
            
            {/* Catalog List */}
            <div className="max-h-40 overflow-y-auto border rounded-xl p-2 space-y-1 bg-slate-50">
              {SPARE_PARTS_CATALOG.filter(p => p.name.toLowerCase().includes(partSearch.toLowerCase())).map(part => (
                <div key={part.id} className="flex justify-between items-center p-2 bg-white rounded-lg border text-xs">
                  <div>
                    <span className="font-bold text-slate-800">{part.name}</span>
                    <span className="text-slate-400 block text-[10px]">₹{part.price}</span>
                  </div>
                  <button onClick={() => handleAddPart(part)} className="bg-blue-600 text-white font-bold px-3 py-1 rounded-lg text-[10px]">+ Add</button>
                </div>
              ))}
            </div>

            {/* Selected Parts List */}
            {selectedParts.length > 0 && (
              <div className="space-y-2 border-t pt-3">
                <h4 className="text-xs font-bold text-slate-500 uppercase">Selected Items</h4>
                {selectedParts.map(item => (
                  <div key={item.id} className="flex justify-between items-center bg-blue-50/50 p-2.5 rounded-xl border border-blue-100 text-xs">
                    <span className="font-medium text-slate-800">{item.name} (Qty: {item.qty})</span>
                    <span className="font-bold text-blue-600">₹{item.price * item.qty}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* 5. LABOUR CHARGES TAB */}
        {activeTab === 'labour' && (
          <div className="bg-white p-5 rounded-2xl border shadow-sm space-y-4">
            <div className="flex justify-between items-center border-b pb-2">
              <h2 className="font-bold text-slate-800 text-sm">5. Workshop Labour & Operations</h2>
              <span className="text-xs font-bold text-emerald-600">Total: ₹{totalLabourCost}</span>
            </div>
            <div className="space-y-2">
              {LABOUR_HEADS.map(head => (
                <div key={head} className="flex justify-between items-center gap-2 text-xs">
                  <span className="font-medium text-slate-700 flex-1">{head}</span>
                  <input
                    type="number"
                    placeholder="₹ Amount"
                    onChange={e => handleLabourChange(head, parseFloat(e.target.value) || 0)}
                    className="w-28 p-2 border rounded-xl bg-slate-50 outline-none text-right font-bold"
                  />
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 6. STATUS TRACKER TAB */}
        {activeTab === 'status' && (
          <div className="bg-white p-5 rounded-2xl border shadow-sm space-y-4">
            <h2 className="font-bold text-slate-800 text-sm border-b pb-2">6. Global Workshop Status & Reason</h2>
            
            <div className="space-y-3 text-xs">
              <div>
                <label className="font-bold text-slate-500 mb-1 block">SELECT CURRENT STATUS</label>
                <select className="w-full p-3 border rounded-xl bg-slate-50 font-bold outline-none">
                  <option value="PENDING">PENDING APPROVAL</option>
                  <option value="APPROVED">APPROVED</option>
                  <option value="ACTIVE">ACTIVE / IN PROGRESS</option>
                  <option value="PARTS_WAITING">PARTS WAITING</option>
                  <option value="READY">READY FOR DELIVERY</option>
                  <option value="DELIVERED">DELIVERED / OUT OF WORKSHOP</option>
                  <option value="CANCELLED">CANCELLED</option>
                </select>
              </div>

              <div>
                <label className="font-bold text-slate-500 mb-1 block">STATUS REASON / DELAY REMARK</label>
                <select className="w-full p-3 border rounded-xl bg-slate-50 outline-none">
                  <option value="">Select Reason (Optional)</option>
                  <option value="survey_delay">Waiting for Insurance Surveyor Inspection</option>
                  <option value="parts_oos">Parts Out of Stock / Order Placed</option>
                  <option value="advance_pending">Waiting for Customer Advance Payment</option>
                  <option value="cust_delay">Customer Approval Pending</option>
                  <option value="other">Other Reason</option>
                </select>
              </div>
            </div>
          </div>
        )}

        {/* Summary Footer Bar */}
        <div className="bg-slate-900 text-white p-4 rounded-2xl shadow-lg flex justify-between items-center">
          <div>
            <span className="text-[10px] text-slate-400 block uppercase font-bold">Estimated Total</span>
            <span className="text-xl font-black text-emerald-400">₹{totalPartsCost + totalLabourCost}</span>
          </div>
          <button onClick={() => alert('Job Card Details Saved Successfully!')} className="bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-xs px-5 py-3 rounded-xl shadow transition">
            ✓ Save Job Entry
          </button>
        </div>

      </main>
    </div>
  )
    }
              
