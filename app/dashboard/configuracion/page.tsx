"use client";

import { useState, useEffect, useRef } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

import { createClient } from "@/lib/supabase";
import { toast } from "sonner";
import {
  User,
  Mail,
  Globe,
  DollarSign,
  Shield,
  Trash2,
  Camera,
  Save,
  LogOut,
  ChevronRight,
  Crown,
  Check,
} from "lucide-react";

// ─── Schema de validación ───────────────────────────────────────────
const profileSchema = z.object({
  full_name: z
    .string()
    .min(2, "El nombre debe tener al menos 2 caracteres")
    .max(50, "Máximo 50 caracteres"),
  timezone: z.string().min(1, "Seleccioná una zona horaria"),
  currency: z.string().min(1, "Seleccioná una moneda"),
});

type ProfileForm = z.infer<typeof profileSchema>;

// ─── Opciones ───────────────────────────────────────────────────────
const TIMEZONES = [
  { value: "America/Argentina/Buenos_Aires", label: "Buenos Aires (ART, UTC-3)" },
  { value: "America/Argentina/Cordoba",      label: "Córdoba (ART, UTC-3)" },
  { value: "America/Argentina/Mendoza",      label: "Mendoza (ART, UTC-3)" },
  { value: "America/Santiago",               label: "Santiago (CLT, UTC-3)" },
  { value: "America/Bogota",                 label: "Bogotá (COT, UTC-5)" },
  { value: "America/Lima",                   label: "Lima (PET, UTC-5)" },
  { value: "America/Mexico_City",            label: "Ciudad de México (CST, UTC-6)" },
  { value: "America/Caracas",                label: "Caracas (VET, UTC-4)" },
  { value: "Europe/Madrid",                  label: "Madrid (CET, UTC+1)" },
  { value: "UTC",                            label: "UTC" },
];

const CURRENCIES = [
  { value: "ARS", label: "ARS — Peso argentino" },
  { value: "USD", label: "USD — Dólar estadounidense" },
  { value: "EUR", label: "EUR — Euro" },
  { value: "BRL", label: "BRL — Real brasileño" },
  { value: "CLP", label: "CLP — Peso chileno" },
  { value: "COP", label: "COP — Peso colombiano" },
  { value: "MXN", label: "MXN — Peso mexicano" },
  { value: "PEN", label: "PEN — Sol peruano" },
];

const PLAN_INFO = {
  free:    { label: "Free",    color: "bg-zinc-100 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300" },
  premium: { label: "Premium", color: "bg-violet-100 text-violet-700 dark:bg-violet-900/40 dark:text-violet-300" },
  pro:     { label: "Pro",     color: "bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300" },
};

type Section = "perfil" | "preferencias" | "cuenta";

// ─── Componente principal ────────────────────────────────────────────
export default function ConfiguracionPage() {
  const supabase = createClient(); 
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [section, setSection]             = useState<Section>("perfil");
  const [loading, setLoading]             = useState(true);
  const [saving, setSaving]               = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [avatarUrl, setAvatarUrl]         = useState<string | null>(null);
  const [email, setEmail]                 = useState("");
  const [plan, setPlan]                   = useState<"free" | "premium" | "pro">("free");
  const [deleteConfirm, setDeleteConfirm] = useState("");
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    watch,
    formState: { errors, isDirty },
  } = useForm<ProfileForm>({ resolver: zodResolver(profileSchema) });

  const fullName = watch("full_name", "");

  // ── Cargar perfil ──────────────────────────────────────────────────
  useEffect(() => {
    async function loadProfile() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      setEmail(user.email ?? "");

      const { data: profile } = await supabase
        .from("profiles")
        .select("full_name, avatar_url, timezone, currency, plan")
        .eq("id", user.id)
        .single();

      if (profile) {
        reset({
          full_name: profile.full_name ?? "",
          timezone:  profile.timezone  ?? "America/Argentina/Buenos_Aires",
          currency:  profile.currency  ?? "ARS",
        });
        setAvatarUrl(profile.avatar_url);
        setPlan(profile.plan ?? "free");
      }
      setLoading(false);
    }
    loadProfile();
  }, [supabase, reset]);

  // ── Guardar perfil ─────────────────────────────────────────────────
  async function onSubmit(data: ProfileForm) {
    setSaving(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { error } = await supabase
      .from("profiles")
      .update({
        full_name:  data.full_name,
        timezone:   data.timezone,
        currency:   data.currency,
        updated_at: new Date().toISOString(),
      })
      .eq("id", user.id);

    if (error) {
      toast.error("No se pudo guardar el perfil");
    } else {
      toast.success("Perfil actualizado");
      reset(data);
    }
    setSaving(false);
  }

  // ── Subir avatar ───────────────────────────────────────────────────
  async function handleAvatarUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) {
      toast.error("El archivo es muy grande. Máximo 2MB.");
      return;
    }

    setUploadingAvatar(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const ext      = file.name.split(".").pop();
    const filePath = `avatars/${user.id}.${ext}`;

    const { error: uploadError } = await supabase.storage
      .from("avatars")
      .upload(filePath, file, { upsert: true });

    if (uploadError) {
      toast.error("Error al subir la imagen");
      setUploadingAvatar(false);
      return;
    }

    const { data: { publicUrl } } = supabase.storage
      .from("avatars")
      .getPublicUrl(filePath);

    await supabase
      .from("profiles")
      .update({ avatar_url: publicUrl, updated_at: new Date().toISOString() })
      .eq("id", user.id);

    setAvatarUrl(publicUrl);
    toast.success("Avatar actualizado");
    setUploadingAvatar(false);
  }

  // ── Cerrar sesión ──────────────────────────────────────────────────
  async function handleSignOut() {
    await supabase.auth.signOut();
    window.location.href = "/login";
  }

  // ── Borrar cuenta ──────────────────────────────────────────────────
  async function handleDeleteAccount() {
    if (deleteConfirm !== "ELIMINAR") return;
    toast.error("Esta función requiere un endpoint de servidor. Implementala en una API route.");
    setShowDeleteModal(false);
  }

  // ── Iniciales para el avatar fallback ─────────────────────────────
  function getInitials(name: string) {
    return name
      .split(" ")
      .map((n) => n[0])
      .slice(0, 2)
      .join("")
      .toUpperCase() || "U";
  }

  // ─────────────────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-violet-500 border-t-transparent" />
      </div>
    );
  }

  const navItems: { id: Section; label: string; icon: React.ReactNode }[] = [
    { id: "perfil",        label: "Perfil",        icon: <User size={16} /> },
    { id: "preferencias",  label: "Preferencias",  icon: <Globe size={16} /> },
    { id: "cuenta",        label: "Cuenta",        icon: <Shield size={16} /> },
  ];

  return (
    <div className="mx-auto max-w-4xl px-4 py-8">

      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-semibold text-zinc-900 dark:text-zinc-50">
          Configuración
        </h1>
        <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
          Administrá tu perfil y preferencias de la cuenta
        </p>
      </div>

      <div className="flex gap-8">

        {/* Sidebar nav */}
        <aside className="w-48 shrink-0">
          <nav className="flex flex-col gap-1">
            {navItems.map((item) => (
              <button
                key={item.id}
                onClick={() => setSection(item.id)}
                className={`flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm transition-colors ${
                  section === item.id
                    ? "bg-violet-50 text-violet-700 font-medium dark:bg-violet-900/30 dark:text-violet-300"
                    : "text-zinc-600 hover:bg-zinc-100 dark:text-zinc-400 dark:hover:bg-zinc-800"
                }`}
              >
                {item.icon}
                {item.label}
                {section === item.id && (
                  <ChevronRight size={14} className="ml-auto" />
                )}
              </button>
            ))}
          </nav>
        </aside>

        {/* Contenido */}
        <div className="flex-1 min-w-0">

          {/* ── PERFIL ─────────────────────────────────────────── */}
          {section === "perfil" && (
            <form onSubmit={handleSubmit(onSubmit)}>
              <Card title="Información personal" description="Tu nombre e imagen que se muestran en la app">

                {/* Avatar */}
                <div className="flex items-center gap-6 pb-6 border-b border-zinc-100 dark:border-zinc-800">
                  <div className="relative">
                    {avatarUrl ? (
                      <img
                        src={avatarUrl}
                        alt="Avatar"
                        className="h-20 w-20 rounded-full object-cover ring-2 ring-zinc-200 dark:ring-zinc-700"
                      />
                    ) : (
                      <div className="h-20 w-20 rounded-full bg-gradient-to-br from-violet-500 to-violet-700 flex items-center justify-center ring-2 ring-zinc-200 dark:ring-zinc-700">
                        <span className="text-2xl font-semibold text-white">
                          {getInitials(fullName)}
                        </span>
                      </div>
                    )}
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      disabled={uploadingAvatar}
                      className="absolute -bottom-1 -right-1 flex h-7 w-7 items-center justify-center rounded-full bg-white dark:bg-zinc-800 shadow border border-zinc-200 dark:border-zinc-700 hover:bg-zinc-50 dark:hover:bg-zinc-700 transition-colors disabled:opacity-50"
                    >
                      {uploadingAvatar
                        ? <div className="h-3 w-3 animate-spin rounded-full border border-violet-500 border-t-transparent" />
                        : <Camera size={13} className="text-zinc-600 dark:text-zinc-300" />
                      }
                    </button>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/png,image/jpeg,image/webp"
                      className="hidden"
                      onChange={handleAvatarUpload}
                    />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-zinc-900 dark:text-zinc-100">
                      Foto de perfil
                    </p>
                    <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
                      PNG, JPG o WebP. Máximo 2MB.
                    </p>
                  </div>
                </div>

                {/* Nombre */}
                <Field label="Nombre completo" error={errors.full_name?.message}>
                  <input
                    {...register("full_name")}
                    placeholder="Agustín Dardanelli"
                    className={inputClass(!!errors.full_name)}
                  />
                </Field>

                {/* Email (read-only) */}
                <Field label="Email" hint="No se puede cambiar desde aquí">
                  <div className="flex items-center gap-2 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800/50 px-3 py-2">
                    <Mail size={14} className="text-zinc-400 shrink-0" />
                    <span className="text-sm text-zinc-500 dark:text-zinc-400">{email}</span>
                  </div>
                </Field>

                {/* Plan badge */}
                <Field label="Plan actual">
                  <div className="flex items-center gap-3">
                    <span className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium ${PLAN_INFO[plan].color}`}>
                      {plan === "pro" || plan === "premium"
                        ? <Crown size={12} />
                        : <Check size={12} />
                      }
                      {PLAN_INFO[plan].label}
                    </span>
                    {plan === "free" && (
                      <span className="text-xs text-zinc-400">
                        Actualizá para desbloquear más features
                      </span>
                    )}
                  </div>
                </Field>

              </Card>

              <SaveBar dirty={isDirty} saving={saving} />
            </form>
          )}

          {/* ── PREFERENCIAS ───────────────────────────────────── */}
          {section === "preferencias" && (
            <form onSubmit={handleSubmit(onSubmit)}>
              <Card title="Preferencias" description="Personalizá cómo se muestran los datos en la app">

                {/* Zona horaria */}
                <Field label="Zona horaria" error={errors.timezone?.message}
                  hint="Se usa para calcular las fechas de tus hábitos y transacciones">
                  <div className="relative">
                    <Globe size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400 pointer-events-none" />
                    <select {...register("timezone")} className={`${inputClass(!!errors.timezone)} pl-9`}>
                      {TIMEZONES.map((tz) => (
                        <option key={tz.value} value={tz.value}>{tz.label}</option>
                      ))}
                    </select>
                  </div>
                </Field>

                {/* Moneda */}
                <Field label="Moneda" error={errors.currency?.message}
                  hint="Se usa para mostrar tus finanzas y transacciones">
                  <div className="relative">
                    <DollarSign size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400 pointer-events-none" />
                    <select {...register("currency")} className={`${inputClass(!!errors.currency)} pl-9`}>
                      {CURRENCIES.map((c) => (
                        <option key={c.value} value={c.value}>{c.label}</option>
                      ))}
                    </select>
                  </div>
                </Field>

              </Card>

              <SaveBar dirty={isDirty} saving={saving} />
            </form>
          )}

          {/* ── CUENTA ─────────────────────────────────────────── */}
          {section === "cuenta" && (
            <div className="flex flex-col gap-4">

              {/* Cerrar sesión */}
              <Card title="Sesión" description="Administrá tu acceso a la app">
                <div className="flex items-center justify-between py-1">
                  <div>
                    <p className="text-sm font-medium text-zinc-900 dark:text-zinc-100">
                      Cerrar sesión
                    </p>
                    <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
                      Cerrá sesión en este dispositivo
                    </p>
                  </div>
                  <button
                    onClick={handleSignOut}
                    className="flex items-center gap-2 rounded-lg border border-zinc-200 dark:border-zinc-700 px-4 py-2 text-sm text-zinc-700 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors"
                  >
                    <LogOut size={14} />
                    Cerrar sesión
                  </button>
                </div>
              </Card>

              {/* Zona de peligro */}
              <div className="rounded-xl border border-red-200 dark:border-red-900/50 overflow-hidden">
                <div className="px-6 py-4 bg-red-50/50 dark:bg-red-950/20 border-b border-red-200 dark:border-red-900/50">
                  <h2 className="text-sm font-semibold text-red-700 dark:text-red-400">
                    Zona de peligro
                  </h2>
                  <p className="text-xs text-red-500 dark:text-red-500 mt-0.5">
                    Estas acciones son irreversibles
                  </p>
                </div>
                <div className="px-6 py-5">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-zinc-900 dark:text-zinc-100">
                        Eliminar cuenta
                      </p>
                      <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
                        Borrá permanentemente tu cuenta y todos tus datos
                      </p>
                    </div>
                    <button
                      onClick={() => setShowDeleteModal(true)}
                      className="flex items-center gap-2 rounded-lg bg-red-600 hover:bg-red-700 px-4 py-2 text-sm text-white transition-colors"
                    >
                      <Trash2 size={14} />
                      Eliminar cuenta
                    </button>
                  </div>
                </div>
              </div>

            </div>
          )}

        </div>
      </div>

      {/* Modal de confirmación de eliminación */}
      {showDeleteModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
          onClick={(e) => e.target === e.currentTarget && setShowDeleteModal(false)}
        >
          <div className="w-full max-w-md rounded-2xl bg-white dark:bg-zinc-900 shadow-xl p-6 mx-4">
            <div className="flex items-center gap-3 mb-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-red-100 dark:bg-red-900/30">
                <Trash2 size={18} className="text-red-600 dark:text-red-400" />
              </div>
              <div>
                <h3 className="text-base font-semibold text-zinc-900 dark:text-zinc-100">
                  Eliminar cuenta
                </h3>
                <p className="text-xs text-zinc-500">Esta acción no se puede deshacer</p>
              </div>
            </div>

            <p className="text-sm text-zinc-600 dark:text-zinc-400 mb-4">
              Se eliminarán permanentemente todos tus hábitos, transacciones, entradas del diario y datos personales.
            </p>

            <div className="mb-4">
              <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300 mb-1.5">
                Escribí <span className="font-mono font-bold">ELIMINAR</span> para confirmar
              </label>
              <input
                type="text"
                value={deleteConfirm}
                onChange={(e) => setDeleteConfirm(e.target.value)}
                placeholder="ELIMINAR"
                className="w-full rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 px-3 py-2 text-sm text-zinc-900 dark:text-zinc-100 outline-none focus:ring-2 focus:ring-red-500"
              />
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => { setShowDeleteModal(false); setDeleteConfirm(""); }}
                className="flex-1 rounded-lg border border-zinc-200 dark:border-zinc-700 px-4 py-2 text-sm text-zinc-700 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={handleDeleteAccount}
                disabled={deleteConfirm !== "ELIMINAR"}
                className="flex-1 rounded-lg bg-red-600 hover:bg-red-700 disabled:opacity-40 disabled:cursor-not-allowed px-4 py-2 text-sm text-white transition-colors"
              >
                Eliminar cuenta
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}

// ─── Componentes auxiliares ──────────────────────────────────────────

function Card({
  title,
  description,
  children,
}: {
  title: string;
  description?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-xl border border-zinc-200 dark:border-zinc-800 overflow-hidden">
      <div className="px-6 py-4 border-b border-zinc-100 dark:border-zinc-800">
        <h2 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">{title}</h2>
        {description && (
          <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">{description}</p>
        )}
      </div>
      <div className="px-6 py-5 flex flex-col gap-5">{children}</div>
    </div>
  );
}

function Field({
  label,
  hint,
  error,
  children,
}: {
  label: string;
  hint?: string;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">{label}</label>
      {children}
      {hint && !error && (
        <p className="text-xs text-zinc-400 dark:text-zinc-500">{hint}</p>
      )}
      {error && <p className="text-xs text-red-500">{error}</p>}
    </div>
  );
}

function SaveBar({ dirty, saving }: { dirty: boolean; saving: boolean }) {
  return (
    <div
      className={`mt-4 flex items-center justify-between rounded-xl border px-5 py-3.5 transition-all duration-300 ${
        dirty
          ? "border-violet-200 bg-violet-50 dark:border-violet-800 dark:bg-violet-950/30"
          : "border-transparent bg-transparent"
      }`}
    >
      <p className={`text-xs transition-opacity ${dirty ? "text-violet-600 dark:text-violet-400 opacity-100" : "opacity-0"}`}>
        Tenés cambios sin guardar
      </p>
      <button
        type="submit"
        disabled={!dirty || saving}
        className="flex items-center gap-2 rounded-lg bg-violet-600 hover:bg-violet-700 disabled:opacity-40 disabled:cursor-not-allowed px-4 py-2 text-sm font-medium text-white transition-colors"
      >
        {saving
          ? <div className="h-3.5 w-3.5 animate-spin rounded-full border border-white border-t-transparent" />
          : <Save size={14} />
        }
        {saving ? "Guardando…" : "Guardar cambios"}
      </button>
    </div>
  );
}

function inputClass(hasError: boolean) {
  return `w-full rounded-lg border ${
    hasError
      ? "border-red-400 focus:ring-red-500"
      : "border-zinc-200 dark:border-zinc-700 focus:ring-violet-500"
  } bg-white dark:bg-zinc-800/50 px-3 py-2 text-sm text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 outline-none focus:ring-2 transition-shadow appearance-none`;
}