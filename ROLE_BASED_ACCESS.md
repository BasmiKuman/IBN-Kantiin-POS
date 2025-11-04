# Role-Based Access Control (RBAC) - IBN Kantiin POS

## Overview
Sistem POS ini mengimplementasikan role-based access control dengan 3 tingkat akses:
- **Admin**: Akses penuh ke semua fitur
- **Manager**: Akses terbatas (Dashboard, Inventori, POS, Laporan, Pelanggan, Pengaturan)
- **Kasir**: Akses dasar untuk operasional kasir

## Implementasi

### 1. Login & Role Assignment (`src/pages/Login.tsx`)
```typescript
// Role ditentukan berdasarkan username saat login
let role = "kasir";
if (username === "admin") role = "admin";
else if (username === "manager") role = "manager";

// Role disimpan di localStorage
localStorage.setItem("userRole", role);
```

**Demo Accounts:**
- `admin` / `admin123` → Role: Admin
- `manager` / `manager123` → Role: Manager  
- `kasir` / `kasir123` → Role: Kasir

### 2. UI-Level Protection (`src/components/AppSidebar.tsx`)
Menu sidebar secara otomatis menyembunyikan item yang tidak diizinkan:

```typescript
const filteredMenuItems = menuItems.filter((item) => {
  // Manager tidak bisa akses menu Karyawan
  if (userRole === "manager" && item.title === "Karyawan") {
    return false;
  }
  return true;
});
```

**Menu Access Matrix:**
| Menu | Admin | Manager | Kasir |
|------|-------|---------|-------|
| Dashboard | ✅ | ✅ | ✅ |
| POS | ✅ | ✅ | ✅ |
| Inventori | ✅ | ✅ | ❌ |
| Laporan | ✅ | ✅ | ❌ |
| Pelanggan | ✅ | ✅ | ❌ |
| **Karyawan** | ✅ | ❌ | ❌ |
| Pengaturan | ✅ | ✅ | ❌ |

### 3. Route-Level Protection (`src/components/ProtectedRoute.tsx`)
Komponen `ProtectedRoute` mendukung parameter `allowedRoles` untuk memblokir akses langsung via URL:

```typescript
interface ProtectedRouteProps {
  children: ReactNode;
  allowedRoles?: string[]; // roles yang diizinkan
}

// Cek role saat route diakses
if (allowedRoles && !allowedRoles.includes(userRole)) {
  toast({
    title: "Akses Ditolak",
    description: "Anda tidak memiliki izin untuk mengakses halaman ini.",
    variant: "destructive",
  });
  navigate("/", { replace: true });
}
```

**Penggunaan di Routes (`src/App.tsx`):**
```tsx
// Halaman Karyawan - hanya untuk Admin
<Route
  path="/employees"
  element={
    <ProtectedRoute allowedRoles={["admin"]}>
      <MainLayout>
        <Employees />
      </MainLayout>
    </ProtectedRoute>
  }
/>
```

### 4. Visual Feedback
**Role Badge di Sidebar Footer:**
- Menampilkan role user secara jelas (Administrator / Manager / Kasir)
- Format: `{Role} • {Login Time}`
- Contoh: "Manager • 13:45"

## Testing Guide

### Test Case 1: Admin Access
1. Login dengan `admin` / `admin123`
2. ✅ Verifikasi badge menampilkan "Administrator"
3. ✅ Verifikasi semua 7 menu terlihat di sidebar
4. ✅ Klik menu "Karyawan" → halaman terbuka normal
5. ✅ Akses langsung ke `/employees` → halaman terbuka normal

### Test Case 2: Manager Access
1. Login dengan `manager` / `manager123`
2. ✅ Verifikasi badge menampilkan "Manager"
3. ✅ Verifikasi hanya 6 menu terlihat (tanpa "Karyawan")
4. ✅ Akses langsung ke `/employees` di address bar
5. ✅ Verifikasi redirect ke Dashboard dengan toast "Akses Ditolak"

### Test Case 3: Kasir Access
1. Login dengan `kasir` / `kasir123`
2. ✅ Verifikasi badge menampilkan "Kasir"
3. ✅ Verifikasi menu sesuai akses kasir
4. ✅ Verifikasi tidak bisa akses halaman restricted

### Test Case 4: Logout & Role Reset
1. Login sebagai Manager
2. Logout
3. ✅ Verifikasi `userRole` dihapus dari localStorage
4. Login sebagai Admin
5. ✅ Verifikasi role berubah ke Admin
6. ✅ Menu "Karyawan" kembali muncul

## Security Notes

### ✅ Implemented
- UI-level menu filtering (sidebar)
- Route-level access control (URL protection)
- Role badge untuk visual feedback
- Toast notification untuk akses ditolak

### ⚠️ Important
Sistem ini menggunakan **localStorage** untuk menyimpan role. Untuk production:
1. Role sebaiknya di-verify dari backend/database
2. Implementasikan JWT atau session-based authentication
3. Tambahkan role verification di Supabase Row Level Security (RLS)
4. Implementasikan API endpoint untuk role verification

### 🔒 Best Practices
- Jangan hardcode credentials di production
- Gunakan Supabase Auth untuk user management
- Implementasikan password hashing
- Tambahkan rate limiting untuk login attempts
- Log semua aktivitas admin/manager

## File Changes Summary

**Modified Files:**
1. `src/pages/Login.tsx` - Role assignment logic
2. `src/components/AppSidebar.tsx` - Menu filtering & role badge
3. `src/components/ProtectedRoute.tsx` - Route-level protection
4. `src/App.tsx` - Applied allowedRoles to /employees route

**localStorage Keys Used:**
- `isLoggedIn`: "true" | "false"
- `username`: string
- `userRole`: "admin" | "manager" | "kasir"
- `loginTime`: HH:mm format

## Future Enhancements

1. **Database Integration**
   - Simpan role di tabel `employees`
   - Sinkronkan dengan Supabase Auth

2. **Granular Permissions**
   - Per-feature permissions (create, read, update, delete)
   - Custom role creation

3. **Audit Log**
   - Track semua akses ke halaman sensitive
   - Log aktivitas CRUD admin/manager

4. **Session Management**
   - Auto-logout setelah idle time
   - Session token expiration
   - Multi-device session control
