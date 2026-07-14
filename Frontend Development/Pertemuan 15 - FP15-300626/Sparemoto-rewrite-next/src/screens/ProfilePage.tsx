"use client";

import { useCallback, useEffect, useState, type FormEvent } from "react";
import Link from "next/link";
import {
  User,
  Mail,
  Phone,
  Calendar,
  MapPin,
  Plus,
  Pencil,
  Trash2,
  Star,
  LogOut,
  Package,
  Save,
  X,
  ChevronRight,
  Lock,
  KeyRound,
} from "lucide-react";
import { useToast } from "@/store/ToastContext";
import { useT, useLocale } from "@/store/LocaleContext";

interface UserProfile {
  id: string;
  firstName: string;
  lastName: string;
  phoneNumber: string;
  email: string;
  createdAt: string;
}

interface Address {
  id: string;
  label: string;
  firstName: string;
  lastName: string;
  phoneNumber: string;
  addressLine1: string;
  addressLine2: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  isDefault: boolean;
}

const emptyAddress: Omit<Address, "id" | "isDefault"> = {
  label: "",
  firstName: "",
  lastName: "",
  phoneNumber: "",
  addressLine1: "",
  addressLine2: "",
  city: "",
  state: "",
  postalCode: "",
  country: "",
};

function formatMemberSince(dateStr: string, locale: string) {
  try {
    const d = new Date(dateStr);
    return d.toLocaleDateString(locale === "id" ? "id-ID" : "en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  } catch {
    return dateStr;
  }
}

export default function ProfilePage() {
  const { showToast } = useToast();
  const t = useT();
  const { locale } = useLocale();

  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  // Profile form
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [savingProfile, setSavingProfile] = useState(false);

  // Address form
  const [showAddressForm, setShowAddressForm] = useState(false);
  const [editingAddressId, setEditingAddressId] = useState<string | null>(null);
  const [savingAddress, setSavingAddress] = useState(false);
  const [addressForm, setAddressForm] = useState(emptyAddress);
  const [addressDefault, setAddressDefault] = useState(false);

  // Deleting
  const [deletingAddressId, setDeletingAddressId] = useState<string | null>(null);

  // Load user data
  const loadProfile = useCallback(async () => {
    try {
      const res = await fetch("/api/auth/me", { credentials: "same-origin" });
      const data = (await res.json()) as {
        user: UserProfile | null;
        addresses: Address[];
      };
      if (data.user) {
        setProfile(data.user);
        setFirstName(data.user.firstName);
        setLastName(data.user.lastName);
        setPhoneNumber(data.user.phoneNumber);
        setIsLoggedIn(true);
      } else {
        setIsLoggedIn(false);
      }
      setAddresses(data.addresses ?? []);
    } catch {
      setIsLoggedIn(false);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadProfile();
  }, [loadProfile]);

  // Save profile
  const handleSaveProfile = async (e: FormEvent) => {
    e.preventDefault();
    setSavingProfile(true);
    try {
      const res = await fetch("/api/auth/profile", {
        method: "PATCH",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ firstName: firstName.trim(), lastName: lastName.trim(), phoneNumber: phoneNumber.trim() }),
      });
      const data = (await res.json()) as { error?: string; user?: UserProfile };
      if (!res.ok || !data.user) throw new Error(data.error || "Failed to update.");
      setProfile(data.user);
      showToast(t("profile.saved"), { type: "success" });
    } catch (err) {
      showToast(err instanceof Error ? err.message : "Failed to update profile.", { type: "error" });
    } finally {
      setSavingProfile(false);
    }
  };

  // Reset address form
  const resetAddressForm = () => {
    setAddressForm(emptyAddress);
    setAddressDefault(false);
    setEditingAddressId(null);
    setShowAddressForm(false);
  };

  // Open address form for edit
  const openEditAddress = (addr: Address) => {
    setAddressForm({
      label: addr.label,
      firstName: addr.firstName,
      lastName: addr.lastName,
      phoneNumber: addr.phoneNumber,
      addressLine1: addr.addressLine1,
      addressLine2: addr.addressLine2,
      city: addr.city,
      state: addr.state,
      postalCode: addr.postalCode,
      country: addr.country,
    });
    setAddressDefault(addr.isDefault);
    setEditingAddressId(addr.id);
    setShowAddressForm(true);
  };

  // Save address (create or update)
  const handleSaveAddress = async (e: FormEvent) => {
    e.preventDefault();
    setSavingAddress(true);
    try {
      const payload = { ...addressForm, isDefault: addressDefault };
      const url = editingAddressId
        ? `/api/auth/addresses/${editingAddressId}`
        : "/api/auth/addresses";
      const method = editingAddressId ? "PATCH" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "content-type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = (await res.json()) as { error?: string; addresses?: Address[] };
      if (!res.ok) throw new Error(data.error || "Failed to save address.");
      setAddresses(data.addresses ?? []);
      resetAddressForm();
      showToast(editingAddressId ? t("profile.saved") : "Address added!", { type: "success" });
    } catch (err) {
      showToast(err instanceof Error ? err.message : "Failed to save address.", { type: "error" });
    } finally {
      setSavingAddress(false);
    }
  };

  // Delete address
  const handleDeleteAddress = async (addressId: string) => {
    setDeletingAddressId(addressId);
    try {
      const res = await fetch(`/api/auth/addresses/${addressId}`, { method: "DELETE" });
      const data = (await res.json()) as { error?: string };
      if (!res.ok) throw new Error(data.error || "Failed to delete address.");
      setAddresses((prev) => prev.filter((a) => a.id !== addressId));
      showToast("Address deleted", { type: "info" });
    } catch (err) {
      showToast(err instanceof Error ? err.message : "Failed to delete address.", { type: "error" });
    } finally {
      setDeletingAddressId(null);
    }
  };

  // Change password
  // Change password
  const [showPasswordForm, setShowPasswordForm] = useState(false);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [savingPassword, setSavingPassword] = useState(false);

  const resetPasswordForm = () => {
    setCurrentPassword("");
    setNewPassword("");
    setConfirmPassword("");
    setShowPasswordForm(false);
  };

  const handleChangePassword = async (e: FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      showToast(t("profile.passwordMismatch"), { type: "error" });
      return;
    }
    setSavingPassword(true);
    try {
      const res = await fetch("/api/auth/change-password", {
        method: "PATCH",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ currentPassword, newPassword }),
      });
      const data = (await res.json()) as { error?: string };
      if (!res.ok) throw new Error(data.error || "Failed to change password.");
      showToast(t("profile.passwordChanged"), { type: "success" });
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      setShowPasswordForm(false);
    } catch (err) {
      showToast(err instanceof Error ? err.message : "Failed to change password.", { type: "error" });
    } finally {
      setSavingPassword(false);
    }
  };

  // Sign out
  const handleSignOut = async () => {
    try {
      await fetch("/api/auth/logout", { method: "DELETE" });
      window.location.href = "/";
    } catch {
      showToast("Failed to sign out.", { type: "error" });
    }
  };

  if (loading) {
    return (
      <div className="mx-auto flex max-w-2xl flex-col px-4 py-16 sm:px-6">
        <div className="animate-pulse space-y-4">
          <div className="h-6 w-32 rounded-lg bg-mono-200 dark:bg-mono-700" />
          <div className="h-4 w-56 rounded-lg bg-mono-100 dark:bg-mono-800" />
          <div className="h-48 rounded-2xl bg-mono-100 dark:bg-mono-800" />
        </div>
      </div>
    );
  }

  if (!isLoggedIn || !profile) {
    return (
      <div className="mx-auto flex max-w-md flex-col items-center px-4 py-16 text-center sm:px-6">
        <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-mono-200 dark:bg-mono-700">
          <User className="h-6 w-6 text-mono-500 dark:text-mono-400" />
        </div>
        <h1 className="text-xl font-bold text-mono-900 dark:text-mono-100">Sign In Required</h1>
        <p className="mt-1 text-sm text-mono-500 dark:text-mono-400">Please sign in to view your profile.</p>
        <Link
          href="/login"
          className="mt-4 inline-flex items-center gap-2 rounded-xl bg-mono-900 dark:bg-mono-100 px-5 py-2.5 text-sm font-semibold text-white dark:text-mono-900 transition hover:bg-mono-800 dark:hover:bg-mono-200"
        >
          Sign In
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6">
      {/* Header */}
      <div className="mb-6 flex items-start justify-between gap-4">
        <div>
          <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-mono-900 dark:bg-mono-100 text-white dark:text-mono-900">
            <User className="h-5 w-5" />
          </div>
          <h1 className="text-2xl font-bold text-mono-900 dark:text-mono-100">{t("profile.title")}</h1>
          <p className="mt-0.5 text-sm text-mono-500 dark:text-mono-400">{t("profile.description")}</p>
        </div>
        <div className="flex shrink-0 flex-col gap-2">
          <Link
            href="/orders"
            className="inline-flex items-center gap-1.5 rounded-xl border border-mono-200 dark:border-mono-700 bg-surface px-3.5 py-2 text-sm font-medium text-mono-700 dark:text-mono-300 transition hover:bg-mono-50 dark:hover:bg-mono-800"
          >
            <Package className="h-4 w-4" />
            {t("profile.orders")}
            <ChevronRight className="h-3.5 w-3.5 text-mono-400" />
          </Link>
          <Link
            href="/reviews"
            className="inline-flex items-center gap-1.5 rounded-xl border border-mono-200 dark:border-mono-700 bg-surface px-3.5 py-2 text-sm font-medium text-mono-700 dark:text-mono-300 transition hover:bg-mono-50 dark:hover:bg-mono-800"
          >
            <Star className="h-4 w-4" />
            {t("profile.reviews")}
            <ChevronRight className="h-3.5 w-3.5 text-mono-400" />
          </Link>
          <button
            type="button"
            onClick={handleSignOut}
            className="inline-flex items-center gap-1.5 rounded-xl border border-mono-200 dark:border-mono-700 bg-surface px-3.5 py-2 text-sm font-medium text-red-600 dark:text-red-400 transition hover:bg-red-50 dark:hover:bg-red-900/20"
          >
            <LogOut className="h-4 w-4" />
            {t("profile.signOut")}
          </button>
        </div>
      </div>

      {/* Personal Information */}
      <form onSubmit={handleSaveProfile} className="mb-6 rounded-2xl border border-mono-200 dark:border-mono-700 bg-surface p-5 shadow-sm">
        <div className="mb-4 flex items-center gap-2">
          <User className="h-4 w-4 text-mono-500 dark:text-mono-400" />
          <h2 className="text-sm font-bold text-mono-900 dark:text-mono-100">{t("profile.personalInfo")}</h2>
        </div>

        <div className="mb-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
          <label className="block">
            <span className="text-xs font-semibold uppercase tracking-[0.18em] text-mono-500 dark:text-mono-400">
              {t("profile.firstName")}
            </span>
            <input
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              className="mt-1.5 w-full rounded-xl border border-mono-200 dark:border-mono-700 bg-surface px-3 py-2.5 text-sm text-mono-900 outline-none transition focus:border-mono-900"
            />
          </label>
          <label className="block">
            <span className="text-xs font-semibold uppercase tracking-[0.18em] text-mono-500 dark:text-mono-400">
              {t("profile.lastName")}
            </span>
            <input
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              className="mt-1.5 w-full rounded-xl border border-mono-200 dark:border-mono-700 bg-surface px-3 py-2.5 text-sm text-mono-900 outline-none transition focus:border-mono-900"
            />
          </label>
          <label className="block">
            <span className="text-xs font-semibold uppercase tracking-[0.18em] text-mono-500 dark:text-mono-400">
              {t("profile.email")}
            </span>
            <div className="relative mt-1.5">
              <Mail className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-mono-400 dark:text-mono-500" />
              <input
                readOnly
                value={profile.email}
                className="w-full rounded-xl border border-mono-200 dark:border-mono-700 bg-mono-100 dark:bg-mono-800 px-3 py-2.5 pl-10 text-sm text-mono-600 dark:text-mono-400 outline-none"
              />
            </div>
          </label>
          <label className="block">
            <span className="text-xs font-semibold uppercase tracking-[0.18em] text-mono-500 dark:text-mono-400">
              {t("profile.phone")}
            </span>
            <div className="relative mt-1.5">
              <Phone className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-mono-400 dark:text-mono-500" />
              <input
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                placeholder="+1 (555) 000-0000"
                className="w-full rounded-xl border border-mono-200 dark:border-mono-700 bg-surface px-3 py-2.5 pl-10 text-sm text-mono-900 outline-none transition focus:border-mono-900"
              />
            </div>
          </label>
        </div>

        <div className="mb-4 flex items-center gap-1.5 text-xs text-mono-400 dark:text-mono-500">
          <Calendar className="h-3.5 w-3.5" />
          <span>
            {t("profile.memberSince", { date: formatMemberSince(profile.createdAt, locale) })}
          </span>
        </div>

        <button
          disabled={savingProfile}
          type="submit"
          className="flex h-10 items-center justify-center gap-2 rounded-xl bg-mono-900 dark:bg-mono-100 px-5 text-sm font-semibold text-white dark:text-mono-900 transition hover:bg-mono-800 dark:hover:bg-mono-200 disabled:opacity-60"
        >
          <Save className="h-4 w-4" />
          {savingProfile ? t("profile.saving") : t("profile.saveChanges")}
        </button>
      </form>

      {/* Change Password */}
      <div className="mb-6 rounded-2xl border border-mono-200 dark:border-mono-700 bg-surface p-5 shadow-sm">
        <button
          type="button"
          onClick={() => {
            if (showPasswordForm) resetPasswordForm();
            else setShowPasswordForm(true);
          }}
          className="flex w-full items-center justify-between"
        >
          <div className="flex items-center gap-2">
            <Lock className="h-4 w-4 text-mono-500 dark:text-mono-400" />
            <h2 className="text-sm font-bold text-mono-900 dark:text-mono-100">{t("profile.changePassword")}</h2>
          </div>
            <ChevronRight
            className={`h-4 w-4 text-mono-400 dark:text-mono-500 transition-transform ${showPasswordForm ? "rotate-90" : ""}`}
          />
        </button>

        {showPasswordForm && (
          <form onSubmit={handleChangePassword} className="mt-4 space-y-3 border-t border-mono-100 dark:border-mono-800 pt-4">
            <label className="block">
              <span className="text-xs font-semibold uppercase tracking-[0.18em] text-mono-500 dark:text-mono-400">
                {t("profile.currentPassword")}
              </span>
              <input
                required
                type="password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                className="mt-1.5 w-full rounded-xl border border-mono-200 dark:border-mono-700 bg-surface px-3 py-2.5 text-sm text-mono-900 outline-none transition focus:border-mono-900"
              />
            </label>
            <label className="block">
              <span className="text-xs font-semibold uppercase tracking-[0.18em] text-mono-500 dark:text-mono-400">
                {t("profile.newPassword")}
              </span>
              <input
                required
                type="password"
                minLength={6}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="mt-1.5 w-full rounded-xl border border-mono-200 dark:border-mono-700 bg-surface px-3 py-2.5 text-sm text-mono-900 outline-none transition focus:border-mono-900"
              />
            </label>
            <label className="block">
              <span className="text-xs font-semibold uppercase tracking-[0.18em] text-mono-500 dark:text-mono-400">
                {t("profile.confirmPassword")}
              </span>
              <input
                required
                type="password"
                minLength={6}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="mt-1.5 w-full rounded-xl border border-mono-200 dark:border-mono-700 bg-surface px-3 py-2.5 text-sm text-mono-900 outline-none transition focus:border-mono-900"
              />
            </label>
            <div className="flex gap-2">
              <button
                disabled={savingPassword}
                type="submit"
                className="flex h-9 items-center justify-center gap-1.5 rounded-xl bg-mono-900 dark:bg-mono-100 px-4 text-xs font-semibold text-white dark:text-mono-900 transition hover:bg-mono-800 dark:hover:bg-mono-200 disabled:opacity-60"
              >
                <KeyRound className="h-3.5 w-3.5" />
                {savingPassword ? t("profile.updating") : t("profile.updatePassword")}
              </button>
              <button
                type="button"
                onClick={resetPasswordForm}
                className="flex h-9 items-center justify-center gap-1.5 rounded-xl border border-mono-200 dark:border-mono-700 bg-surface px-4 text-xs font-semibold text-mono-600 transition hover:bg-mono-100"
              >
                <X className="h-3.5 w-3.5" />
                {t("profile.cancel")}
              </button>
            </div>
          </form>
        )}
      </div>

      {/* Addresses */}
      <div className="rounded-2xl border border-mono-200 dark:border-mono-700 bg-surface p-5 shadow-sm">
        <div className="mb-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <MapPin className="h-4 w-4 text-mono-500 dark:text-mono-400" />
            <h2 className="text-sm font-bold text-mono-900 dark:text-mono-100">{t("profile.addresses")}</h2>
          </div>
          {!showAddressForm && (
            <button
              type="button"
              onClick={() => {
                resetAddressForm();
                setShowAddressForm(true);
              }}
              className="inline-flex items-center gap-1.5 rounded-lg bg-mono-900 dark:bg-mono-100 px-3 py-1.5 text-xs font-semibold text-white dark:text-mono-900 transition hover:bg-mono-800 dark:hover:bg-mono-200"
            >
              <Plus className="h-3.5 w-3.5" />
              {t("profile.addAddress")}
            </button>
          )}
        </div>

        {/* Address list */}
        {!showAddressForm && addresses.length === 0 && (
          <p className="py-6 text-center text-sm text-mono-400 dark:text-mono-500">{t("profile.noAddresses")}</p>
        )}

        {!showAddressForm &&
          addresses.map((addr) => (
            <div
              key={addr.id}
              className="group relative mb-3 rounded-xl border border-mono-200 dark:border-mono-700 bg-surface p-4 last:mb-0"
            >
              <div className="mb-1.5 flex items-center gap-2">
                {addr.label && (
                  <span className="rounded-md bg-mono-200 dark:bg-mono-700 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-mono-600 dark:text-mono-300">
                    {addr.label}
                  </span>
                )}
                {addr.isDefault && (
                  <span className="inline-flex items-center gap-1 rounded-md bg-amber-100 dark:bg-amber-900/30 px-2 py-0.5 text-[10px] font-semibold text-amber-800 dark:text-amber-300">
                    <Star className="h-3 w-3 fill-current" />
                    {t("profile.defaultAddress")}
                  </span>
                )}
              </div>
              <p className="text-sm font-medium text-mono-900 dark:text-mono-100">
                {addr.firstName} {addr.lastName}
              </p>
              <p className="text-xs text-mono-500 dark:text-mono-400">
                {addr.addressLine1}
                {addr.addressLine2 ? `, ${addr.addressLine2}` : ""}
              </p>
              <p className="text-xs text-mono-500 dark:text-mono-400">
                {addr.city}, {addr.state} {addr.postalCode}, {addr.country}
              </p>
              {addr.phoneNumber && (
                <p className="mt-0.5 text-xs text-mono-400 dark:text-mono-500">{addr.phoneNumber}</p>
              )}
              <div className="mt-2 flex gap-2 opacity-0 transition-opacity group-hover:opacity-100">
                <button
                  type="button"
                  onClick={() => openEditAddress(addr)}
                  className="inline-flex items-center gap-1 rounded-lg border border-mono-200 dark:border-mono-700 bg-surface px-2.5 py-1 text-[11px] font-medium text-mono-600 dark:text-mono-400 transition hover:bg-mono-100 dark:hover:bg-mono-800"
                >
                  <Pencil className="h-3 w-3" />
                  {t("profile.editAddress")}
                </button>
                <button
                  type="button"
                  onClick={() => handleDeleteAddress(addr.id)}
                  disabled={deletingAddressId === addr.id}
                  className="inline-flex items-center gap-1 rounded-lg border border-red-200 dark:border-red-800 bg-surface px-2.5 py-1 text-[11px] font-medium text-red-600 dark:text-red-400 transition hover:bg-red-50 dark:hover:bg-red-900/20 disabled:opacity-50"
                >
                  <Trash2 className="h-3 w-3" />
                  {deletingAddressId === addr.id ? "..." : t("profile.deleteAddress")}
                </button>
                {!addr.isDefault && (
                  <button
                    type="button"
                    onClick={async () => {
                      try {
                        const res = await fetch(`/api/auth/addresses/${addr.id}`, {
                          method: "PATCH",
                          headers: { "content-type": "application/json" },
                          body: JSON.stringify({ isDefault: true }),
                        });
                        const data = (await res.json()) as {
                          error?: string;
                          addresses?: Address[];
                        };
                        if (!res.ok) throw new Error(data.error || "Failed.");
                        setAddresses(data.addresses ?? []);
                        showToast("Default address set", { type: "success" });
                      } catch (err) {
                        showToast(
                          err instanceof Error ? err.message : "Failed to update.",
                          { type: "error" }
                        );
                      }
                    }}
                    className="inline-flex items-center gap-1 rounded-lg border border-mono-200 dark:border-mono-700 bg-surface px-2.5 py-1 text-[11px] font-medium text-mono-600 dark:text-mono-400 transition hover:bg-mono-100 dark:hover:bg-mono-800"
                  >
                    <Star className="h-3 w-3" />
                    {t("profile.setAsDefault")}
                  </button>
                )}
              </div>
            </div>
          ))}

        {/* Address form */}
        {showAddressForm && (
          <form onSubmit={handleSaveAddress} className="rounded-xl border border-mono-200 dark:border-mono-700 bg-surface p-4">
            <h3 className="mb-3 text-sm font-semibold text-mono-900 dark:text-mono-100">
              {editingAddressId ? t("profile.editAddress") : t("profile.addAddress")}
            </h3>
            <div className="mb-3 grid grid-cols-1 gap-3 sm:grid-cols-2">
              <label className="block sm:col-span-2">
                <span className="text-[10px] font-semibold uppercase tracking-[0.18em] text-mono-500 dark:text-mono-400">
                  {t("profile.addressLabel")}
                </span>
                <input
                  value={addressForm.label}
                  onChange={(e) => setAddressForm((p) => ({ ...p, label: e.target.value }))}
                  placeholder="Home, Office, etc."
                  className="mt-1 w-full rounded-xl border border-mono-200 dark:border-mono-700 bg-surface px-3 py-2 text-sm text-mono-900 outline-none transition focus:border-mono-900"
                />
              </label>
              <label className="block">
                <span className="text-[10px] font-semibold uppercase tracking-[0.18em] text-mono-500 dark:text-mono-400">
                  {t("profile.firstName")}
                </span>
                <input
                  value={addressForm.firstName}
                  onChange={(e) => setAddressForm((p) => ({ ...p, firstName: e.target.value }))}
                  className="mt-1 w-full rounded-xl border border-mono-200 dark:border-mono-700 bg-surface px-3 py-2 text-sm text-mono-900 outline-none transition focus:border-mono-900"
                />
              </label>
              <label className="block">
                <span className="text-[10px] font-semibold uppercase tracking-[0.18em] text-mono-500 dark:text-mono-400">
                  {t("profile.lastName")}
                </span>
                <input
                  value={addressForm.lastName}
                  onChange={(e) => setAddressForm((p) => ({ ...p, lastName: e.target.value }))}
                  className="mt-1 w-full rounded-xl border border-mono-200 dark:border-mono-700 bg-surface px-3 py-2 text-sm text-mono-900 outline-none transition focus:border-mono-900"
                />
              </label>
              <label className="block sm:col-span-2">
                <span className="text-[10px] font-semibold uppercase tracking-[0.18em] text-mono-500 dark:text-mono-400">
                  {t("profile.phone")}
                </span>
                <input
                  value={addressForm.phoneNumber}
                  onChange={(e) => setAddressForm((p) => ({ ...p, phoneNumber: e.target.value }))}
                  className="mt-1 w-full rounded-xl border border-mono-200 dark:border-mono-700 bg-surface px-3 py-2 text-sm text-mono-900 outline-none transition focus:border-mono-900"
                />
              </label>
              <label className="block sm:col-span-2">
                <span className="text-[10px] font-semibold uppercase tracking-[0.18em] text-mono-500 dark:text-mono-400">
                  {t("profile.addressLine1")}
                </span>
                <input
                  required
                  value={addressForm.addressLine1}
                  onChange={(e) => setAddressForm((p) => ({ ...p, addressLine1: e.target.value }))}
                  className="mt-1 w-full rounded-xl border border-mono-200 dark:border-mono-700 bg-surface px-3 py-2 text-sm text-mono-900 outline-none transition focus:border-mono-900"
                />
              </label>
              <label className="block sm:col-span-2">
                <span className="text-[10px] font-semibold uppercase tracking-[0.18em] text-mono-500 dark:text-mono-400">
                  {t("profile.addressLine2")}
                </span>
                <input
                  value={addressForm.addressLine2}
                  onChange={(e) => setAddressForm((p) => ({ ...p, addressLine2: e.target.value }))}
                  className="mt-1 w-full rounded-xl border border-mono-200 dark:border-mono-700 bg-surface px-3 py-2 text-sm text-mono-900 outline-none transition focus:border-mono-900"
                />
              </label>
              <label className="block">
                <span className="text-[10px] font-semibold uppercase tracking-[0.18em] text-mono-500 dark:text-mono-400">
                  {t("profile.city")}
                </span>
                <input
                  required
                  value={addressForm.city}
                  onChange={(e) => setAddressForm((p) => ({ ...p, city: e.target.value }))}
                  className="mt-1 w-full rounded-xl border border-mono-200 dark:border-mono-700 bg-surface px-3 py-2 text-sm text-mono-900 outline-none transition focus:border-mono-900"
                />
              </label>
              <label className="block">
                <span className="text-[10px] font-semibold uppercase tracking-[0.18em] text-mono-500 dark:text-mono-400">
                  {t("profile.state")}
                </span>
                <input
                  required
                  value={addressForm.state}
                  onChange={(e) => setAddressForm((p) => ({ ...p, state: e.target.value }))}
                  className="mt-1 w-full rounded-xl border border-mono-200 dark:border-mono-700 bg-surface px-3 py-2 text-sm text-mono-900 outline-none transition focus:border-mono-900"
                />
              </label>
              <label className="block">
                <span className="text-[10px] font-semibold uppercase tracking-[0.18em] text-mono-500 dark:text-mono-400">
                  {t("profile.postalCode")}
                </span>
                <input
                  required
                  value={addressForm.postalCode}
                  onChange={(e) => setAddressForm((p) => ({ ...p, postalCode: e.target.value }))}
                  className="mt-1 w-full rounded-xl border border-mono-200 dark:border-mono-700 bg-surface px-3 py-2 text-sm text-mono-900 outline-none transition focus:border-mono-900"
                />
              </label>
              <label className="block">
                <span className="text-[10px] font-semibold uppercase tracking-[0.18em] text-mono-500 dark:text-mono-400">
                  {t("profile.country")}
                </span>
                <input
                  required
                  value={addressForm.country}
                  onChange={(e) => setAddressForm((p) => ({ ...p, country: e.target.value }))}
                  className="mt-1 w-full rounded-xl border border-mono-200 dark:border-mono-700 bg-surface px-3 py-2 text-sm text-mono-900 outline-none transition focus:border-mono-900"
                />
              </label>
              <label className="flex items-center gap-2 sm:col-span-2">
                <input
                  type="checkbox"
                  checked={addressDefault}
                  onChange={(e) => setAddressDefault(e.target.checked)}
                  className="h-4 w-4 rounded border-mono-300 text-mono-900 focus:ring-mono-900"
                />
                <span className="text-xs font-medium text-mono-700 dark:text-mono-300">
                  {t("profile.setAsDefault")}
                </span>
              </label>
            </div>
            <div className="flex gap-2">
              <button
                disabled={savingAddress}
                type="submit"
                className="flex h-9 items-center justify-center gap-1.5 rounded-xl bg-mono-900 dark:bg-mono-100 px-4 text-xs font-semibold text-white dark:text-mono-900 transition hover:bg-mono-800 dark:hover:bg-mono-200 disabled:opacity-60"
              >
                <Save className="h-3.5 w-3.5" />
                {savingAddress ? t("profile.saving") : t("profile.saveAddress")}
              </button>
              <button
                type="button"
                onClick={resetAddressForm}
                className="flex h-9 items-center justify-center gap-1.5 rounded-xl border border-mono-200 dark:border-mono-700 bg-surface px-4 text-xs font-semibold text-mono-600 transition hover:bg-mono-100"
              >
                <X className="h-3.5 w-3.5" />
                {t("profile.cancel")}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
