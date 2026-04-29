import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ArrowLeft, Lock, UserPlus, Users } from "lucide-react";
import { actions, useStore } from "@/lib/store";

const Login = () => {
  const [mode, setMode] = useState<"admin" | "client" | "signup" | null>(null);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const currentUser = useStore((s) => s.auth.currentUser);

  useEffect(() => {
    if (currentUser) navigate("/", { replace: true });
  }, [currentUser, navigate]);

  useEffect(() => {
    if (mode === "admin") setEmail("leo@gmail.com");
    if (mode !== "admin" && mode !== "signup") setError("");
  }, [mode]);

  const title = mode === "admin" ? "Admin Login" : mode === "client" ? "Client Login" : "Create New User";
  const description =
    mode === "admin"
      ? "Sign in as an administrator to manage invoices and clients."
      : mode === "client"
      ? "Sign in as a client to view your invoice details."
      : "Register a new account to start using Leo Invoice.";

  const handleSubmit = () => {
    setError("");
    try {
      if (mode === "signup") {
        if (!name.trim() || !email.trim() || !password.trim()) throw new Error("Please complete all fields.");
        actions.registerClientUser(name.trim(), email.trim(), password);
        navigate("/");
        return;
      }
      if (!mode) return;
      if (!email.trim() || !password.trim()) throw new Error("Please enter your email and password.");
      actions.signIn(email.trim(), password, mode);
      navigate("/");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Login failed.");
    }
  };

  return (
    <div className="mx-auto flex min-h-[calc(100vh-4rem)] max-w-4xl flex-col justify-center px-4 py-10 sm:px-6 lg:px-8">
      <div className="rounded-3xl border border-border bg-card p-8 shadow-soft">
        <div className="flex items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Leo Invoice</h1>
            <p className="mt-2 text-sm text-muted-foreground">Choose how you want to sign in.</p>
          </div>
          <Link to="/" className="inline-flex items-center gap-2 rounded-xl border border-border bg-background px-4 py-2 text-sm font-semibold hover:bg-secondary">
            <ArrowLeft className="h-4 w-4" /> Back
          </Link>
        </div>

        {!mode ? (
          <div className="mt-10 grid gap-4 md:grid-cols-3">
            <button onClick={() => setMode("admin")} className="rounded-3xl border border-border bg-background p-6 text-left transition hover:border-primary hover:bg-secondary">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                <Lock className="h-5 w-5" />
              </div>
              <h2 className="mt-4 text-lg font-semibold">Admin Login</h2>
              <p className="mt-2 text-sm text-muted-foreground">Manage invoices, clients and settings.</p>
            </button>
            <button onClick={() => setMode("client")} className="rounded-3xl border border-border bg-background p-6 text-left transition hover:border-primary hover:bg-secondary">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-success/10 text-success">
                <Users className="h-5 w-5" />
              </div>
              <h2 className="mt-4 text-lg font-semibold">Client Login</h2>
              <p className="mt-2 text-sm text-muted-foreground">View invoices issued to your account.</p>
            </button>
            <button onClick={() => setMode("signup")} className="rounded-3xl border border-border bg-background p-6 text-left transition hover:border-primary hover:bg-secondary">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                <UserPlus className="h-5 w-5" />
              </div>
              <h2 className="mt-4 text-lg font-semibold">New User</h2>
              <p className="mt-2 text-sm text-muted-foreground">Create an account to start billing with Leo Invoice.</p>
            </button>
          </div>
        ) : (
          <div className="mt-10 rounded-3xl border border-border bg-background p-8">
            <div className="mb-6">
              <h2 className="text-2xl font-semibold">{title}</h2>
              <p className="mt-2 text-sm text-muted-foreground">{description}</p>
            </div>
            {mode === "signup" && (
              <div className="grid gap-4 md:grid-cols-2">
                <label className="space-y-2 text-sm">
                  <span>Name</span>
                  <input value={name} onChange={(e) => setName(e.target.value)} className="w-full rounded-2xl border border-border bg-background px-4 py-3 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/10" placeholder="Your name" />
                </label>
                <label className="space-y-2 text-sm">
                  <span>Email</span>
                  <input value={email} onChange={(e) => setEmail(e.target.value)} className="w-full rounded-2xl border border-border bg-background px-4 py-3 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/10" placeholder="you@example.com" />
                </label>
              </div>
            )}
            <div className="mt-4 grid gap-4">
              <label className="space-y-2 text-sm">
                <span>Email</span>
                <input value={email} onChange={(e) => setEmail(e.target.value)} className="w-full rounded-2xl border border-border bg-background px-4 py-3 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/10" placeholder="you@example.com" />
              </label>
              <label className="space-y-2 text-sm">
                <span>Password</span>
                <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} className="w-full rounded-2xl border border-border bg-background px-4 py-3 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/10" placeholder="Enter your password" />
              </label>
            </div>
            {mode === "admin" && (
              <p className="mt-3 text-sm text-muted-foreground">Admin login: use email <strong>leo@gmail.com</strong> and password <strong>Leo123!</strong></p>
            )}
            {error && <div className="mt-4 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>}
            <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <button onClick={() => setMode(null)} className="rounded-2xl border border-border bg-card px-5 py-3 text-sm font-semibold hover:bg-secondary">Back</button>
              <button onClick={handleSubmit} className="rounded-2xl bg-primary px-5 py-3 text-sm font-semibold text-primary-foreground hover:opacity-90">Continue</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Login;
