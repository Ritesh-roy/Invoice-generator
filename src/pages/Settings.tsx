import { ChangeEvent } from "react";
import { Moon, Sun, Upload } from "lucide-react";
import { actions, useStore } from "@/lib/store";

const inputBase = "w-full rounded-xl border border-border bg-background px-3.5 py-2.5 text-sm outline-none focus:border-primary focus:ring-4 focus:ring-primary/10";
const labelBase = "mb-1.5 block text-xs font-semibold uppercase tracking-wider text-muted-foreground";

const Settings = () => {
  const s = useStore((x) => x.settings);

  const onLogo = (e: ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;
    const reader = new FileReader();
    reader.onload = () => actions.updateSettings({ logo: String(reader.result) });
    reader.readAsDataURL(f);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">Settings</h1>
        <p className="mt-1 text-sm text-muted-foreground">Manage company details and appearance.</p>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 rounded-2xl border border-border bg-card p-6 shadow-soft">
          <h2 className="text-base font-semibold">Company Details</h2>
          <div className="mt-5 grid gap-4 sm:grid-cols-2">
            <div className="sm:col-span-2"><label className={labelBase}>Company Name</label><input className={inputBase} value={s.companyName} onChange={(e) => actions.updateSettings({ companyName: e.target.value })} /></div>
            <div><label className={labelBase}>Email</label><input className={inputBase} value={s.email} onChange={(e) => actions.updateSettings({ email: e.target.value })} /></div>
            <div><label className={labelBase}>Phone</label><input className={inputBase} value={s.phone} onChange={(e) => actions.updateSettings({ phone: e.target.value })} /></div>
            <div><label className={labelBase}>Country</label><select className={inputBase} value={s.country} onChange={(e) => actions.updateSettings({ country: e.target.value })}>
                <option value="India">India</option>
                <option value="United States">United States</option>
                <option value="United Kingdom">United Kingdom</option>
                <option value="Australia">Australia</option>
              </select>
            </div>
            <div><label className={labelBase}>City</label><input className={inputBase} value={s.city} onChange={(e) => actions.updateSettings({ city: e.target.value })} /></div>
            <div><label className={labelBase}>Postal Code</label><input className={inputBase} value={s.postalCode} onChange={(e) => actions.updateSettings({ postalCode: e.target.value })} /></div>
            <div><label className={labelBase}>State</label><input className={inputBase} value={s.state} onChange={(e) => actions.updateSettings({ state: e.target.value })} /></div>
            <div className="sm:col-span-2"><label className={labelBase}>Address</label><input className={inputBase} value={s.address} onChange={(e) => actions.updateSettings({ address: e.target.value })} /></div>
            <div><label className={labelBase}>GST Number</label><input className={inputBase} value={s.gstNumber} onChange={(e) => actions.updateSettings({ gstNumber: e.target.value })} /></div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="rounded-2xl border border-border bg-card p-6 shadow-soft">
            <h2 className="text-base font-semibold">Logo</h2>
            <div className="mt-4 flex flex-col items-center gap-4">
              <div className="flex h-24 w-24 items-center justify-center overflow-hidden rounded-2xl border border-border bg-secondary">
                {s.logo ? <img src={s.logo} alt="logo" className="h-full w-full object-cover" /> :
                  <span className="text-3xl font-bold text-muted-foreground">{s.companyName.slice(0,1)}</span>}
              </div>
              <label className="flex cursor-pointer items-center gap-2 rounded-xl border border-border bg-background px-4 py-2 text-sm font-semibold hover:bg-secondary">
                <Upload className="h-4 w-4" /> Upload
                <input type="file" accept="image/*" className="hidden" onChange={onLogo} />
              </label>
              {s.logo && (
                <button onClick={() => actions.updateSettings({ logo: "" })} className="text-xs font-semibold text-destructive hover:underline">Remove</button>
              )}
            </div>
          </div>

          <div className="rounded-2xl border border-border bg-card p-6 shadow-soft">
            <h2 className="text-base font-semibold">Appearance</h2>
            <div className="mt-4 grid grid-cols-2 gap-2">
              <button
                onClick={() => actions.updateSettings({ theme: "light" })}
                className={`flex flex-col items-center gap-2 rounded-xl border p-4 text-sm font-semibold transition ${
                  s.theme === "light" ? "border-primary bg-primary/5 text-primary" : "border-border hover:bg-secondary"
                }`}
              >
                <Sun className="h-5 w-5" /> Light
              </button>
              <button
                onClick={() => actions.updateSettings({ theme: "dark" })}
                className={`flex flex-col items-center gap-2 rounded-xl border p-4 text-sm font-semibold transition ${
                  s.theme === "dark" ? "border-primary bg-primary/5 text-primary" : "border-border hover:bg-secondary"
                }`}
              >
                <Moon className="h-5 w-5" /> Dark
              </button>
            </div>
            <div className="mt-6">
              <label className={labelBase}>Language</label>
              <select className={inputBase} value={s.language} onChange={(e) => actions.updateSettings({ language: e.target.value as "English" | "Hindi" })}>
                <option value="English">English</option>
                <option value="Hindi">Hindi</option>
              </select>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;
