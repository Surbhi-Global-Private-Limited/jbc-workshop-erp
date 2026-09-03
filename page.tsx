'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://mgibrfygyibzfmmtsnwq.supabase.co'
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'sb_publishable_wYtL56DK1XY3nWe6bkATgg_oxzx742V'
const supabase = createClient(supabaseUrl, supabaseKey)

const BRANDS = ['Maruti Suzuki', 'Hyundai', 'Tata', 'Mahindra', 'Kia', 'Toyota', 'Honda', 'MG', 'Renault', 'Nissan', 'Volkswagen', 'Skoda', 'Ford', 'Jeep', 'BMW', 'Mercedes', 'Audi']

export default function Home() {
  const [activeTab, setActiveTab] = useState<'dashboard' | 'create' | 'search'>('dashboard')
  const [loading, setLoading] = useState(false)
  const [jobType, setJobType] = useState<'cash' | 'insurance'>('cash')
  const [searchQuery, setSearchQuery] = useState('')
  const [searchResults, setSearchResults] = useState<any[]>([])
  
  const [stats, setStats] = useState({ total: 0, inWorkshop: 0, ready: 0 })

  useEffect(() => {
    fetchStats()
  }, [])

  const fetchStats = async () => {
    const { count: total } = await supabase.from('vehicles').select('*', { count: 'exact', head: true })
    const { count: inWorkshop } = await supabase.from('job_cards').select('*', { count: 'exact', head: true }).neq('status', 'delivered')
    const { count: ready } = await supabase.from('job_cards').select('*', { count: 'exact', head: true }).eq('status', 'complete')
    setStats({ total: total || 0, inWorkshop: inWorkshop || 0, ready: ready || 0 })
  }

  const handleCreateJobCard = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setLoading(true)
    const formData = new FormData(e.currentTarget)

    const { data: customer, error: cErr } = await supabase
      .from('customers')
      .upsert({
        name: formData.get('customer_name') as string,
        mobile: formData.get('mobile') as string,
        address: formData.get('address') as string
      }, { onConflict: 'mobile' }).select().single()

    if (cErr) { alert('Customer Error: ' + cErr.message); setLoading(false); return }

    const { data: vehicle, error: vErr } = await supabase
      .from('vehicles')
      .upsert({
        customer_id: customer.id,
        vehicle_number: (formData.get('vehicle_number') as string).toUpperCase(),
        brand: formData.get('brand') as string,
        model: formData.get('model') as string
      }, { onConflict: 'vehicle_number' }).select().single()

    if (vErr) { alert('Vehicle Error: ' + vErr.message); setLoading(false); return }

    const { error: jErr } = await supabase.from('job_cards').insert({
      customer_id: customer.id,
      vehicle_id: vehicle.id,
      job_type: jobType,
      insurance_company: jobType === 'insurance' ? formData.get('insurance_company') as string : null,
      surveyor_name: jobType === 'insurance' ? formData.get('surveyor_name') as string : null,
      remarks: formData.get('remarks') as string,
      status: 'received'
    })

    setLoading(false)
    if (jErr) {
      alert('Error creating Job Card: ' + jErr.message)
    } else {
      alert('Job Card Created Successfully!')
      fetchStats()
      setActiveTab('dashboard')
    }
  }

  const handleSearch = async () => {
    if (!searchQuery) return
    const { data } = await supabase.from('vehicles').select('*, customers(*)').ilike('vehicle_number', `%${searchQuery}%`)
    setSearchResults(data || [])
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 font-sans pb-12">
      <header className="bg-blue-900 text-white p-4 shadow-md flex justify-between items-center">
        <div>
          <h1 className="font-bold text-lg leading-tight">JBC Workshop ERP</h1>
          <p className="text-xs text-blue-200">Surbhi Global PVT Ltd</p>
        </div>
      </header>

      <nav className="flex border-b bg-white text-sm font-medium sticky top-0 z-10">
        <button onClick={() => setActiveTab('dashboard')} className={`flex-1 py-3 text-center ${activeTab === 'dashboard' ? 'border-b-2 border-blue-600 text-blue-600 font-bold' : 'text-slate-500'}`}>Dashboard</button>
        <button onClick={() => setActiveTab('create')} className={`flex-1 py-3 text-center ${activeTab === 'create' ? 'border-b-2 border-blue-600 text-blue-600 font-bold' : 'text-slate-500'}`}>+ New Job Card</button>
        <button onClick={() => setActiveTab('search')} className={`flex-1 py-3 text-center ${activeTab === 'search' ? 'border-b-2 border-blue-600 text-blue-600 font-bold' : 'text-slate-500'}`}>Search</button>
      </nav>

      <main className="p-4 max-w-lg mx-auto">
        {activeTab === 'dashboard' && (
          <div className="space-y-4">
            <div className="grid grid-cols-3 gap-3 text-center">
              <div className="bg-white p-3 rounded-xl border shadow-sm">
                <span className="block text-2xl font-bold text-blue-600">{stats.total}</span>
                <span className="text-xs text-slate-500">Total Vehicles</span>
              </div>
              <div className="bg-white p-3 rounded-xl border shadow-sm">
                <span className="block text-2xl font-bold text-amber-600">{stats.inWorkshop}</span>
                <span className="text-xs text-slate-500">In Workshop</span>
              </div>
              <div className="bg-white p-3 rounded-xl border shadow-sm">
                <span className="block text-2xl font-bold text-emerald-600">{stats.ready}</span>
                <span className="text-xs text-slate-500">Ready</span>
              </div>
            </div>

            <div className="bg-white p-4 rounded-xl border shadow-sm">
              <h2 className="font-bold mb-2 text-sm text-slate-700">Quick Actions</h2>
              <button onClick={() => setActiveTab('create')} className="w-full bg-blue-600 text-white py-2.5 rounded-lg text-sm font-medium shadow hover:bg-blue-700">Create New Job Card</button>
            </div>
          </div>
        )}

        {activeTab === 'create' && (
          <form onSubmit={handleCreateJobCard} className="bg-white p-4 rounded-xl border shadow-sm space-y-4">
            <h2 className="font-bold text-base border-b pb-2 text-slate-800">New Job Entry</h2>

            <div className="space-y-3">
              <input name="customer_name" required placeholder="Customer Name *" className="w-full p-2.5 border rounded-lg text-sm" />
              <input name="mobile" required placeholder="Mobile Number *" className="w-full p-2.5 border rounded-lg text-sm" />
              <input name="vehicle_number" required placeholder="Vehicle No (e.g. MP20CB1234) *" className="w-full p-2.5 border rounded-lg text-sm uppercase" />

              <select name="brand" required className="w-full p-2.5 border rounded-lg text-sm bg-white">
                <option value="">Select Brand *</option>
                {BRANDS.map(b => <option key={b} value={b}>{b}</option>)}
              </select>

              <input name="model" required placeholder="Model (e.g. Swift) *" className="w-full p-2.5 border rounded-lg text-sm" />

              <div className="flex gap-4 pt-1">
                <label className="text-sm"><input type="radio" name="job_type" value="cash" checked={jobType === 'cash'} onChange={() => setJobType('cash')} /> Cash</label>
                <label className="text-sm"><input type="radio" name="job_type" value="insurance" checked={jobType === 'insurance'} onChange={() => setJobType('insurance')} /> Insurance</label>
              </div>

              {jobType === 'insurance' && (
                <div className="space-y-3 p-3 bg-blue-50 rounded-lg border border-blue-100">
                  <input name="insurance_company" required placeholder="Insurance Company Name *" className="w-full p-2.5 border rounded-lg text-sm bg-white" />
                  <input name="surveyor_name" placeholder="Surveyor Name" className="w-full p-2.5 border rounded-lg text-sm bg-white" />
                </div>
              )}

              <textarea name="remarks" placeholder="Work / Complaint Details" className="w-full p-2.5 border rounded-lg text-sm" />
            </div>

            <button type="submit" disabled={loading} className="w-full bg-emerald-600 text-white py-3 rounded-lg font-bold text-sm shadow hover:bg-emerald-700">
              {loading ? 'Saving Entry...' : 'Save Job Card'}
            </button>
          </form>
        )}

        {activeTab === 'search' && (
          <div className="bg-white p-4 rounded-xl border shadow-sm space-y-4">
            <div className="flex gap-2">
              <input value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} placeholder="Enter Vehicle Number" className="flex-1 p-2.5 border rounded-lg text-sm uppercase" />
              <button onClick={handleSearch} className="bg-blue-600 text-white px-4 py-2.5 rounded-lg text-sm font-medium">Search</button>
            </div>

            <div className="space-y-2">
              {searchResults.map((item) => (
                <div key={item.id} className="p-3 border rounded-lg bg-slate-50">
                  <div className="font-bold text-sm text-blue-900">{item.vehicle_number}</div>
                  <div className="text-xs text-slate-600">{item.brand} - {item.model}</div>
                  <div className="text-xs text-slate-500 mt-1">Owner: {item.customers?.name} ({item.customers?.mobile})</div>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>
    </div>
  )
        }
          
