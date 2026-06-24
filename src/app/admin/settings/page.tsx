"use client"
import { useState, useEffect } from "react"
import { Settings, Save, Globe, Key, Rss } from "lucide-react"
import toast from "react-hot-toast"

export default function AdminSettingsPage() {
  const [form, setForm] = useState({
    site_name: "GTA 6 Rewards",
    gemini_api_key: "",
    rss_feeds: "",
    auto_publish: "false",
    scrape_interval: "360",
  })

  useEffect(() => {
    fetch("/api/settings")
      .then(r => r.json())
      .then((data) => {
        if (data.site_name) setForm((f) => ({ ...f, ...data }))
      })
      .catch(() => {})
  }, [])

  const handleSave = async () => {
    try {
      await fetch("/api/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      })
      toast.success("Settings saved!")
    } catch {
      toast.error("Failed to save")
    }
  }

  return (
    <div className="min-h-screen pt-24 pb-16">
      <div className="page-container max-w-2xl">
        <div className="flex items-center gap-3 mb-8">
          <Settings className="w-6 h-6 text-gray-400" />
          <h1 className="text-2xl font-heading font-bold text-white">Settings</h1>
        </div>

        <div className="space-y-6">
          <div className="glass-card p-6">
            <h3 className="text-lg font-heading font-bold text-white mb-4 flex items-center gap-2">
              <Globe className="w-5 h-5 text-neon-blue" /> General
            </h3>
            <div>
              <label className="text-sm text-gray-400 mb-1 block">Site Name</label>
              <input
                type="text"
                value={form.site_name}
                onChange={(e) => setForm((f) => ({ ...f, site_name: e.target.value }))}
                className="input-field"
              />
            </div>
          </div>

          <div className="glass-card p-6">
            <h3 className="text-lg font-heading font-bold text-white mb-4 flex items-center gap-2">
              <Key className="w-5 h-5 text-neon-green" /> Gemini AI
            </h3>
            <div>
              <label className="text-sm text-gray-400 mb-1 block">Gemini API Key</label>
              <input
                type="password"
                value={form.gemini_api_key}
                onChange={(e) => setForm((f) => ({ ...f, gemini_api_key: e.target.value }))}
                className="input-field"
                placeholder="AIza..."
              />
              <p className="text-xs text-gray-500 mt-1">Get free at https://aistudio.google.com</p>
            </div>
          </div>

          <div className="glass-card p-6">
            <h3 className="text-lg font-heading font-bold text-white mb-4 flex items-center gap-2">
              <Rss className="w-5 h-5 text-orange-500" /> Auto-Scraping
            </h3>
            <div className="space-y-4">
              <div>
                <label className="text-sm text-gray-400 mb-1 block">RSS Feed URLs (one per line)</label>
                <textarea
                  value={form.rss_feeds}
                  onChange={(e) => setForm((f) => ({ ...f, rss_feeds: e.target.value }))}
                  className="input-field min-h-[100px]"
                  placeholder="https://www.ign.com/rss/articles&#10;https://www.rockstargames.com/newswire/feed.xml"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm text-gray-400 mb-1 block">Auto-Publish</label>
                  <select
                    value={form.auto_publish}
                    onChange={(e) => setForm((f) => ({ ...f, auto_publish: e.target.value }))}
                    className="input-field"
                  >
                    <option value="false">Off (save as draft)</option>
                    <option value="true">On (publish immediately)</option>
                  </select>
                </div>
                <div>
                  <label className="text-sm text-gray-400 mb-1 block">Scrape Interval (minutes)</label>
                  <input
                    type="number"
                    value={form.scrape_interval}
                    onChange={(e) => setForm((f) => ({ ...f, scrape_interval: e.target.value }))}
                    className="input-field"
                  />
                </div>
              </div>
            </div>
          </div>

          <button onClick={handleSave} className="btn-primary flex items-center gap-2">
            <Save className="w-4 h-4" /> Save Settings
          </button>
        </div>
      </div>
    </div>
  )
}
