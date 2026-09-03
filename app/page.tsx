'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://mgibrfygyibzfmmtsnwq.supabase.co'
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'sb_publishable_wYtL56DK1XY3nWe6bkATgg_oxzx742V'
const supabase = createClient(supabaseUrl, supabaseKey)

const BRANDS = ['Maruti Suzuki', 'Hyundai', 'Tata', 'Mahindra', 'Kia', 'Toyota', 'Honda', 'MG', 'Renault', 'Volkswagen', 'Skoda', 'Ford', 'BMW', 'Mercedes', 'Audi', 'Other']

export default function Home() {
  const [activeTab, setActiveTab] = useState<'dashboard' | 'create' | 'jobs' | 'pickup' | 'parts' | 'accounts'>('dashboard')
  const [loading, setLoading] = useState(false)
  const [jobType, setJobType] = useState<'cash' | 'insurance'>('cash')
  const [searchQuery, setSearchQuery] = useState('')
  const [jobsList, setJobsList] = useState<any[]>([])
  const [stats, setStats] = useState({ total: 0, inWorkshop: 0, ready: 0, delivered: 0 })

  useEffect(() => {
    fetchStats()
    fetchJobs()
  }, [])

  const fetchStats = async () => {
    const { count: total } = await supabase.from('vehicles').select('*', { count: 'exact', head: true })
    const { count: inWorkshop } = await supabase.from('job_cards').select('*', { count: 'exact', head: true }).eq('status', 'received')
    const { count: ready } = await supabase.from('job_cards').select('*', { count: 'exact', head: true }).eq('status', 'complete')
    const { count: delivered } = await supabase.from('job_cards').select('*', { count: 'exact', head: true }).eq('status', 'delivered')
    setStats({ total: total || 0, inWorkshop: inWorkshop || 0, ready: ready || 0, delivered: delivered || 0 })
  }

  const fetchJobs = async () => {
    const { data } = await supabase.from('job_cards').select('*, customers(*), vehicles(*)').order('created_at', { ascending: false })
    setJobsList(data || [])
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
      fetchJobs()
      setActiveTab('jobs')
    }
  }

  const sendWhatsApp = (job: any) => {
    const text = `*JBC WORKSHOP ERP*\nJob Card Created!\n*Vehicle:* ${job.vehicles?.vehicle_number}\n*Brand/Model:* ${job.vehicles?.brand} ${job.vehicles?.model}\n*Owner:* ${job.customers?.name}\n*Status:* ${job.status.toUpperCase()}`
    window.open(`https://wa.me/91${job.customers?.mobile}?text=${encodeURIComponent(text)}`, '_blank')
  }

  return (
    <div className="min-h-screen bg-slate-100 text-slate-800 pb-20">
      {/* Header */}
      <header className="bg-slate-900 text-white p-4 shadow-lg sticky top-0 z-50 flex justify-between items-center border-b border-slate-700">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center font-black text-xl shadow">JBC</div>
          <div>
            <h1 className="font-extrabold text-base tracking-wide leading-none">JBC WORKSHOP ERP</h1>
            <p className="text-[10px] text-blue-400 uppercase font-semibold tracking-wider">Surbhi Global PVT Ltd</p>
          </div>
        </div>
        <span className="bg-emerald-500/20 text-emerald-400 text-xs px-2.5 py-1 rounded-full font-medium border border-emerald-500/30">● Live</span>
      </header>

      {/* Main Container */}
      <main className="max-w-2xl mx-auto p-4">
        {/* Navigation Tabs */}
        <div className="flex bg-white p-1.5 rounded-2xl shadow-sm border mb-5 overflow-x-auto gap-1 text-xs font-bold text-slate-600">
          <button onClick={() => setActiveTab('dashboard')} className={`flex-1 py-2.5 px-3 rounded-xl transition ${activeTab === 'dashboard' ? 'bg-blue-600 text-white shadow' : 'hover:bg-slate-50'}`}>📊 Dashboard</button>
          <button onClick={() => setActiveTab('create')} className={`flex-1 py-2.5 px-3 rounded-xl transition ${activeTab === 'create' ? 'bg-blue-600 text-white shadow' : 'hover:bg-slate-50'}`}>➕ New Job</button>
          <button onClick={() => setActiveTab('jobs')} className={`flex-1 py-2.5 px-3 rounded-xl transition ${activeTab === 'jobs' ? 'bg-blue-600 text-white shadow' : 'hover:bg-slate-50'}`}>📋 Job Cards</button>
          <button onClick={() => setActiveTab('pickup')} className={`flex-1 py-2.5 px-3 rounded-xl transition ${activeTab === 'pickup' ? 'bg-blue-600 text-white shadow' : 'hover:bg-slate-50'}`}>🚨 Pickup</button>
          <button onClick={() => setActiveTab('parts')} className={`flex-1 py-2.5 px-3 rounded-xl transition ${activeTab === 'parts' ? 'bg-blue-600 text-white shadow' : 'hover:bg-slate-50'}`}>⚙️ Parts</button>
        </div>

        {/* DASHBOARD TAB */}
        {activeTab === 'dashboard' && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-white p-4 rounded-2xl border shadow-sm flex flex-col justify-between">
                <span className="text-xs font-semibold text-slate-400 uppercase">Total Vehicles</span>
                <span className="text-3xl font-black text-slate-800 mt-2">{stats.total}</span>
              </div>
              <div className="bg-white p-4 rounded-2xl border shadow-sm flex flex-col justify-between">
                <span className="text-xs font-semibold text-amber-500 uppercase">In Workshop</span>
                <span className="text-3xl font-black text-amber-600 mt-2">{stats.inWorkshop}</span>
              </div>
              <div className="bg-white p-4 rounded-2xl border shadow-sm flex flex-col justify-between">
                <span className="text-xs font-semibold text-emerald-500 uppercase">Ready For Delivery</span>
                <span className="text-3xl font-black text-emerald-600 mt-2">{stats.ready}</span>
              </div>
              <div className="bg-white p-4 rounded-2xl border shadow-sm flex flex-col justify-between">
                <span className="text-xs font-semibold text-blue-500 uppercase">Delivered</span>
                <span className="text-3xl font-black text-blue-600 mt-2">{stats.delivered}</span>
              </div>
            </div>

            <div className="bg-gradient-to-br from-blue-900 to-indigo-900 text-white p-5 rounded-2xl shadow-lg">
              <h3 className="font-bold text-lg">Quick Job Entry</h3>
              <p className="text-xs text-blue-200 mt-1 mb-4">Create a new workshop job card with customer details & vehicle brand.</p>
              <button onClick={() => setActiveTab('create')} className="w-full bg-blue-500 hover:bg-blue-400 text-white font-bold py-3 rounded-xl shadow-md transition">
                + Create Job Card Now
              </button>
            </div>
          </div>
        )}

        {/* CREATE JOB TAB */}
        {activeTab === 'create' && (
          <form onSubmit={handleCreateJobCard} className="bg-white p-5 rounded-2xl border shadow-sm space-y-4">
            <div className="border-b pb-3 flex justify-between items-center">
              <h2 className="font-black text-lg text-slate-800">New Vehicle Job Entry</h2>
              <span className="text-xs bg-slate-100 text-slate-600 px-2.5 py-1 rounded-lg font-bold">Step 1 of 1</span>
            </div>

            <div className="space-y-3">
              <div>
                <label className="text-xs font-bold text-slate-500 mb-1 block">CUSTOMER DETAILS</label>
                <input name="customer_name" required placeholder="Customer Full Name *" className="w-full p-3 border rounded-xl text-sm bg-slate-50 focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none mb-2" />
                <input name="mobile" required placeholder="Mobile Number (10 digits) *" type="tel" className="w-full p-3 border rounded-xl text-sm bg-slate-50 focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none mb-2" />
                <input name="address" placeholder="Customer Address" className="w-full p-3 border rounded-xl text-sm bg-slate-50 focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none" />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-500 mb-1 block">VEHICLE DETAILS</label>
                <input name="vehicle_number" required placeholder="Vehicle Number (e.g. MP20CB1234) *" className="w-full p-3 border rounded-xl text-sm uppercase font-bold tracking-wide bg-slate-50 focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none mb-2" />
                <div className="grid grid-cols-2 gap-2">
                  <select name="brand" required className="p-3 border rounded-xl text-sm bg-slate-50 focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none">
                    <option value="">Select Brand *</option>
                    {BRANDS.map(b => <option key={b} value={b}>{b}</option>)}
                  </select>
                  <input name="model" required placeholder="Model (e.g. Swift) *" className="p-3 border rounded-xl text-sm bg-slate-50 focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none" />
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-500 mb-1 block">JOB TYPE</label>
                <div className="grid grid-cols-2 gap-3 mb-2">
                  <button type="button" onClick={() => setJobType('cash')} className={`py-3 rounded-xl border font-bold text-xs ${jobType === 'cash' ? 'bg-blue-50 border-blue-600 text-blue-600' : 'bg-slate-50 text-slate-600'}`}>💵 Cash Work</button>
                  <button type="button" onClick={() => setJobType('insurance')} className={`py-3 rounded-xl border font-bold text-xs ${jobType === 'insurance' ? 'bg-blue-50 border-blue-600 text-blue-600' : 'bg-slate-50 text-slate-600'}`}>🛡️ Insurance Claim</button>
                </div>

                {jobType === 'insurance' && (
                  <div className="p-3 bg-blue-50 rounded-xl border border-blue-200 space-y-2">
                    <input name="insurance_company" required placeholder="Insurance Company Name *" className="w-full p-2.5 border rounded-lg text-sm bg-white" />
                    <input name="surveyor_name" placeholder="Surveyor Name & Contact" className="w-full p-2.5 border rounded-lg text-sm bg-white" />
                  </div>
                )}
              </div>

              <div>
                <label className="text-xs font-bold text-slate-500 mb-1 block">COMPLAINT / WORK REQUIRED</label>
                <textarea name="remarks" rows={3} placeholder="Describe customer complaints or repair requirements..." className="w-full p-3 border rounded-xl text-sm bg-slate-50 focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none" />
              </div>
            </div>

            <button type="submit" disabled={loading} className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3.5 rounded-xl shadow-md text-sm transition">
              {loading ? 'Saving Job Card...' : '✓ Complete & Save Job Card'}
            </button>
          </form>
        )}

        {/* JOB CARDS LIST TAB */}
        {activeTab === 'jobs' && (
          <div className="space-y-3">
            <input 
              value={searchQuery} 
              onChange={(e) => setSearchQuery(e.target.value)} 
              placeholder="🔍 Search by Vehicle No or Customer Name..." 
              className="w-full p-3.5 border rounded-2xl bg-white shadow-sm text-sm outline-none focus:ring-2 focus:ring-blue-500" 
            />

            {jobsList.filter(j => j.vehicles?.vehicle_number.includes(searchQuery.toUpperCase()) || j.customers?.name.toLowerCase().includes(searchQuery.toLowerCase())).map((job) => (
              <div key={job.id} className="bg-white p-4 rounded-2xl border shadow-sm space-y-3">
                <div className="flex justify-between items-start">
                  <div>
                    <span className="font-black text-lg text-slate-900 tracking-wide">{job.vehicles?.vehicle_number}</span>
                    <p className="text-xs text-slate-500 font-medium">{job.vehicles?.brand} {job.vehicles?.model}</p>
                  </div>
                  <span className={`text-[10px] uppercase font-black px-2.5 py-1 rounded-full ${job.job_type === 'insurance' ? 'bg-purple-100 text-purple-700' : 'bg-green-100 text-green-700'}`}>
                    {job.job_type}
                  </span>
                </div>

                <div className="text-xs text-slate-600 bg-slate-50 p-2.5 rounded-xl space-y-1">
                  <div><strong>Customer:</strong> {job.customers?.name} ({job.customers?.mobile})</div>
                  {job.remarks && <div><strong>Complaint:</strong> {job.remarks}</div>}
                </div>

                <div className="flex gap-2 pt-1">
                  <button onClick={() => sendWhatsApp(job)} className="flex-1 bg-emerald-500 hover:bg-emerald-600 text-white font-bold py-2 rounded-xl text-xs flex items-center justify-center gap-1 shadow-sm">
                    💬 WhatsApp Share
                  </button>
                  <button onClick={() => window.print()} className="bg-slate-800 text-white font-bold px-3 py-2 rounded-xl text-xs">
                    🖨️ Print
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* ACCIDENT PICKUP TAB */}
        {activeTab === 'pickup' && (
          <div className="bg-white p-5 rounded-2xl border shadow-sm text-center py-8">
            <div className="text-4xl mb-2">🚨</div>
            <h3 className="font-bold text-slate-800">Accident Pickup Register</h3>
            <p className="text-xs text-slate-500 max-w-xs mx-auto mt-1 mb-4">Record towing charges, driver info & spot photos directly from site.</p>
            <button className="bg-blue-600 text-white text-xs font-bold px-4 py-2.5 rounded-xl">+ Add New Pickup Case</button>
          </div>
        )}

        {/* SPARE PARTS TAB */}
        {activeTab === 'parts' && (
          <div className="bg-white p-5 rounded-2xl border shadow-sm text-center py-8">
            <div className="text-4xl mb-2">⚙️</div>
            <h3 className="font-bold text-slate-800">Spare Parts & Inventory</h3>
            <p className="text-xs text-slate-500 max-w-xs mx-auto mt-1 mb-4">Manage stock levels, part numbers, and part billing for job cards.</p>
            <button className="bg-blue-600 text-white text-xs font-bold px-4 py-2.5 rounded-xl">+ Add Spare Part</button>
          </div>
        )}
      </main>
    </div>
  )
        }
          
