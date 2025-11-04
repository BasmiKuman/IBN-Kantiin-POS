# Update UI - Foto Profil & Tombol Logout

## ✅ Perubahan yang Dilakukan

### 1. Tombol Logout - Warna Font Hitam
- Tombol logout di sidebar sekarang menggunakan warna font **hitam** (`text-black`)
- Tetap ada hover effect merah saat dihover

### 2. Foto Profil di Sidebar (Pojok Kiri Bawah)
- Foto profil karyawan ditampilkan di sidebar footer
- Posisi: **Di atas tombol logout**, pojok kiri bawah
- Avatar berbentuk bulat dengan border
- Menampilkan:
  - Foto profil karyawan (jika ada)
  - Icon user default (jika belum ada foto)
  - Nama user
  - Role (Administrator/Manager/Kasir)
  - Waktu login
- Size: 40x40px (h-10 w-10)

### 3. User Info Card di Dashboard (Pojok Kanan Atas)
- Card info user di pojok kanan atas dashboard
- Menampilkan:
  - Foto profil karyawan (avatar bulat 48x48px)
  - Nama user
  - Badge role (Administrator/Manager/Kasir)
- Design: Card dengan padding yang rapi
- Responsive: min-width 250px

---

## 📸 Preview

### Sidebar Footer (Kiri Bawah)
```
┌─────────────────────────┐
│  [Foto]  Username       │
│          Role • Waktu   │
│                         │
│  [Logout] (font hitam)  │
└─────────────────────────┘
```

### Dashboard Header (Kanan Atas)
```
Dashboard                    ┌──────────────────┐
Ringkasan bisnis...          │ [Foto] Username  │
                             │        [Role]    │
                             └──────────────────┘
```

---

## 🎨 Style Details

### Sidebar - Foto Profil
```tsx
<Avatar className="h-10 w-10 border-2 border-primary/20">
  <AvatarImage src={photoUrl} />
  <AvatarFallback className="bg-primary/10">
    <User className="h-5 w-5 text-primary" />
  </AvatarFallback>
</Avatar>
```

### Sidebar - Tombol Logout
```tsx
<Button 
  variant="outline" 
  className="w-full justify-start gap-2 text-black hover:bg-destructive/10 hover:text-destructive hover:border-destructive/30" 
  onClick={handleLogout}
>
  <LogOut className="h-4 w-4" />
  Logout
</Button>
```
- `text-black` → Font warna hitam
- `hover:text-destructive` → Hover jadi merah

### Dashboard - User Card
```tsx
<Card className="w-auto min-w-[250px]">
  <CardContent className="p-4">
    <Avatar className="h-12 w-12 border-2 border-primary/20">
      ...
    </Avatar>
    <Badge variant="secondary" className="text-xs mt-1">
      {role}
    </Badge>
  </CardContent>
</Card>
```

---

## 🔧 Technical Implementation

### Data Flow

1. **Load User Data**
   ```typescript
   const employeeId = localStorage.getItem("employeeId");
   const username = localStorage.getItem("username");
   const userRole = localStorage.getItem("userRole");
   ```

2. **Fetch Photo from Database**
   ```typescript
   supabase
     .from('employees')
     .select('photo_url')
     .eq('id', employeeId)
     .single()
     .then(({ data }) => {
       if (data?.photo_url) {
         setPhotoUrl(data.photo_url);
       }
     });
   ```

3. **Display in UI**
   - Sidebar: Avatar di footer section
   - Dashboard: Avatar di header pojok kanan atas

---

## 📂 File yang Dimodifikasi

### 1. `/src/components/AppSidebar.tsx`
- ✅ Import `Avatar`, `AvatarFallback`, `AvatarImage`
- ✅ Added state: `photoUrl`
- ✅ Fetch foto profil dari database on mount
- ✅ Updated sidebar footer dengan avatar foto
- ✅ Changed logout button text color to black (`text-black`)

### 2. `/src/pages/Dashboard.tsx`
- ✅ Import `Avatar`, `Badge`, `User` icon
- ✅ Import `useState`, `useEffect`, `supabase`
- ✅ Added state: `username`, `userRole`, `photoUrl`
- ✅ Fetch user data dan foto on mount
- ✅ Added user profile card di pojok kanan atas header
- ✅ Card menampilkan foto, nama, dan role badge

---

## 🎯 Summary

**Perubahan UI berhasil diimplementasikan:**

1. ✅ **Tombol Logout** - Font warna hitam
2. ✅ **Foto Profil di Sidebar** - Pojok kiri bawah, di atas tombol logout
3. ✅ **User Info Card di Dashboard** - Pojok kanan atas dengan foto + role

**Fitur yang ditampilkan:**
- Foto profil karyawan (atau icon default)
- Nama user
- Role/posisi (Administrator/Manager/Kasir)
- Waktu login (sidebar only)

**Siap digunakan setelah:**
Migration `CREATE_ADMIN_ACCOUNT.sql` dijalankan untuk menambahkan kolom `photo_url` ke database.
