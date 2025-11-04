import { useState, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { UserCog, Plus, Award, Clock, Pencil, Trash2, Calendar, CheckCircle, XCircle, Upload, User } from "lucide-react";
import { useEmployees, useCreateEmployee, useUpdateEmployee, useDeleteEmployee } from "@/hooks/supabase/useEmployees";
import { useTodayAttendance, useAttendanceSummary } from "@/hooks/supabase/useAttendance";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export default function Employees() {
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState<any>(null);
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string>("");
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    position: "",
    username: "",
    password: "",
    hire_date: "",
    photo_url: "",
  });

  const { toast } = useToast();
  const { data: employees = [], isLoading } = useEmployees();
  const { data: todayAttendance = [] } = useTodayAttendance();
  const { data: attendanceSummary = [] } = useAttendanceSummary();
  const createEmployee = useCreateEmployee();
  const updateEmployee = useUpdateEmployee();
  const deleteEmployee = useDeleteEmployee();

  // Handle photo upload
  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) { // Max 2MB
        toast({
          title: "File Terlalu Besar",
          description: "Ukuran foto maksimal 2MB",
          variant: "destructive",
        });
        return;
      }
      
      setPhotoFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPhotoPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const uploadPhoto = async (): Promise<string | null> => {
    if (!photoFile) return null;

    setIsUploading(true);
    try {
      const fileExt = photoFile.name.split('.').pop();
      const fileName = `${Math.random().toString(36).substring(2)}_${Date.now()}.${fileExt}`;
      const filePath = `employee-photos/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('employees')
        .upload(filePath, photoFile);

      if (uploadError) {
        throw uploadError;
      }

      const { data } = supabase.storage
        .from('employees')
        .getPublicUrl(filePath);

      return data.publicUrl;
    } catch (error: any) {
      toast({
        title: "Error Upload Foto",
        description: error.message,
        variant: "destructive",
      });
      return null;
    } finally {
      setIsUploading(false);
    }
  };

  const handleCreateEmployee = async () => {
    if (!formData.name || !formData.position || !formData.username || !formData.password) {
      toast({
        title: "Error",
        description: "Nama, Posisi, Username, dan Password wajib diisi",
        variant: "destructive",
      });
      return;
    }

    let photoUrl = formData.photo_url;
    if (photoFile) {
      photoUrl = await uploadPhoto() || "";
    }

    createEmployee.mutate({
      name: formData.name,
      email: formData.email || null,
      phone: formData.phone || null,
      position: formData.position,
      username: formData.username,
      password: formData.password,
      salary: null,
      hire_date: formData.hire_date || null,
      is_active: true,
      user_id: null,
      photo_url: photoUrl || null,
    }, {
      onSuccess: () => {
        toast({
          title: "Karyawan Berhasil Ditambahkan",
          description: `${formData.name} dengan username: ${formData.username} telah dibuat`,
        });
        setIsAddDialogOpen(false);
        setFormData({
          name: "",
          email: "",
          phone: "",
          position: "",
          username: "",
          password: "",
          hire_date: "",
          photo_url: "",
        });
        setPhotoFile(null);
        setPhotoPreview("");
      },
      onError: (error: any) => {
        toast({
          title: "Error",
          description: error.message || "Gagal menambahkan karyawan",
          variant: "destructive",
        });
      }
    });
  };

  const handleUpdateEmployee = async () => {
    if (!editingEmployee) return;

    let photoUrl = formData.photo_url;
    if (photoFile) {
      photoUrl = await uploadPhoto() || formData.photo_url;
    }

    const updateData: any = {
      id: editingEmployee.id,
      name: formData.name,
      email: formData.email || null,
      phone: formData.phone || null,
      position: formData.position,
      salary: null,
      hire_date: formData.hire_date || null,
      is_active: editingEmployee.is_active,
      user_id: editingEmployee.user_id,
      photo_url: photoUrl || null,
    };

    // Only update username/password if provided
    if (formData.username) {
      updateData.username = formData.username;
    }
    if (formData.password) {
      updateData.password = formData.password;
    }

    updateEmployee.mutate(updateData, {
      onSuccess: () => {
        toast({
          title: "Karyawan Berhasil Diupdate",
          description: `Data ${formData.name} telah diperbarui`,
        });
        setIsEditDialogOpen(false);
        setEditingEmployee(null);
        setFormData({
          name: "",
          email: "",
          phone: "",
          position: "",
          username: "",
          password: "",
          hire_date: "",
          photo_url: "",
        });
        setPhotoFile(null);
        setPhotoPreview("");
      }
    });
  };

  const handleEditClick = (employee: any) => {
    setEditingEmployee(employee);
    setFormData({
      name: employee.name,
      email: employee.email || "",
      phone: employee.phone || "",
      position: employee.position || "",
      username: "", // Don't show existing credentials for security
      password: "",
      hire_date: employee.hire_date || "",
      photo_url: employee.photo_url || "",
    });
    setPhotoPreview(employee.photo_url || "");
    setPhotoFile(null);
    setIsEditDialogOpen(true);
  };

  const handleDeleteClick = (id: string) => {
    if (confirm("Yakin ingin menghapus karyawan ini?")) {
      deleteEmployee.mutate(id);
    }
  };

  const totalEmployees = employees.length;
  const activeEmployees = employees.filter(e => e.is_active).length;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Memuat data karyawan...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Manajemen Karyawan</h2>
          <p className="text-muted-foreground">Kelola tim dan performa karyawan</p>
        </div>
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Tambah Karyawan
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Tambah Karyawan Baru</DialogTitle>
              <DialogDescription>Masukkan informasi karyawan</DialogDescription>
            </DialogHeader>
            <div className="space-y-4 max-h-[70vh] overflow-y-auto pr-2">
              {/* Foto Profil */}
              <div className="space-y-2">
                <Label>Foto Profil</Label>
                <div className="flex items-center gap-4">
                  <Avatar className="h-20 w-20">
                    <AvatarImage src={photoPreview || undefined} />
                    <AvatarFallback>
                      <User className="h-10 w-10" />
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handlePhotoChange}
                      className="hidden"
                    />
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => fileInputRef.current?.click()}
                    >
                      <Upload className="mr-2 h-4 w-4" />
                      {photoPreview ? "Ganti Foto" : "Upload Foto"}
                    </Button>
                    <p className="text-xs text-muted-foreground mt-1">
                      Max 2MB, format: JPG, PNG
                    </p>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <Label>Nama Lengkap *</Label>
                <Input 
                  placeholder="Nama karyawan" 
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                />
              </div>
              <div className="space-y-2">
                <Label>Email</Label>
                <Input 
                  type="email" 
                  placeholder="email@example.com" 
                  value={formData.email}
                  onChange={(e) => setFormData({...formData, email: e.target.value})}
                />
              </div>
              <div className="space-y-2">
                <Label>No. Telepon</Label>
                <Input 
                  placeholder="08123456789" 
                  value={formData.phone}
                  onChange={(e) => setFormData({...formData, phone: e.target.value})}
                />
              </div>
              <div className="space-y-2">
                <Label>Posisi *</Label>
                <Select value={formData.position} onValueChange={(value) => setFormData({...formData, position: value})}>
                  <SelectTrigger>
                    <SelectValue placeholder="Pilih posisi" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="admin">Admin</SelectItem>
                    <SelectItem value="manager">Manager</SelectItem>
                    <SelectItem value="kasir">Kasir</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Username *</Label>
                  <Input 
                    placeholder="username" 
                    value={formData.username}
                    onChange={(e) => setFormData({...formData, username: e.target.value})}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Password *</Label>
                  <Input 
                    type="password"
                    placeholder="********" 
                    value={formData.password}
                    onChange={(e) => setFormData({...formData, password: e.target.value})}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Tanggal Mulai</Label>
                <Input 
                  type="date" 
                  value={formData.hire_date}
                  onChange={(e) => setFormData({...formData, hire_date: e.target.value})}
                />
              </div>
              <Button 
                className="w-full"
                onClick={handleCreateEmployee}
                disabled={createEmployee.isPending || isUploading}
              >
                {isUploading ? "Mengupload foto..." : createEmployee.isPending ? "Menyimpan..." : "Simpan Karyawan"}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Karyawan</DialogTitle>
            <DialogDescription>Update informasi karyawan</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 max-h-[70vh] overflow-y-auto pr-2">
            {/* Foto Profil */}
            <div className="space-y-2">
              <Label>Foto Profil</Label>
              <div className="flex items-center gap-4">
                <Avatar className="h-20 w-20">
                  <AvatarImage src={photoPreview || undefined} />
                  <AvatarFallback>
                    <User className="h-10 w-10" />
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handlePhotoChange}
                    className="hidden"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    <Upload className="mr-2 h-4 w-4" />
                    {photoPreview ? "Ganti Foto" : "Upload Foto"}
                  </Button>
                  <p className="text-xs text-muted-foreground mt-1">
                    Max 2MB, format: JPG, PNG
                  </p>
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <Label>Nama Lengkap *</Label>
              <Input 
                placeholder="Nama karyawan" 
                value={formData.name}
                onChange={(e) => setFormData({...formData, name: e.target.value})}
              />
            </div>
            <div className="space-y-2">
              <Label>Email</Label>
              <Input 
                type="email" 
                placeholder="email@example.com" 
                value={formData.email}
                onChange={(e) => setFormData({...formData, email: e.target.value})}
              />
            </div>
            <div className="space-y-2">
              <Label>No. Telepon</Label>
              <Input 
                placeholder="08123456789" 
                value={formData.phone}
                onChange={(e) => setFormData({...formData, phone: e.target.value})}
              />
            </div>
            <div className="space-y-2">
              <Label>Posisi *</Label>
              <Select value={formData.position} onValueChange={(value) => setFormData({...formData, position: value})}>
                <SelectTrigger>
                  <SelectValue placeholder="Pilih posisi" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="admin">Admin</SelectItem>
                  <SelectItem value="manager">Manager</SelectItem>
                  <SelectItem value="kasir">Kasir</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Username</Label>
                <Input 
                  placeholder="Biarkan kosong jika tidak ingin mengubah" 
                  value={formData.username}
                  onChange={(e) => setFormData({...formData, username: e.target.value})}
                />
              </div>
              <div className="space-y-2">
                <Label>Password</Label>
                <Input 
                  type="password"
                  placeholder="Biarkan kosong jika tidak ingin mengubah" 
                  value={formData.password}
                  onChange={(e) => setFormData({...formData, password: e.target.value})}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Tanggal Mulai</Label>
              <Input 
                type="date" 
                value={formData.hire_date}
                onChange={(e) => setFormData({...formData, hire_date: e.target.value})}
              />
            </div>
            <Button 
              className="w-full"
              onClick={handleUpdateEmployee}
              disabled={updateEmployee.isPending || isUploading}
            >
              {isUploading ? "Mengupload foto..." : updateEmployee.isPending ? "Menyimpan..." : "Update Karyawan"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Karyawan</CardTitle>
            <UserCog className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalEmployees}</div>
            <p className="text-xs text-muted-foreground">{activeEmployees} aktif</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Karyawan Aktif</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{activeEmployees}</div>
            <p className="text-xs text-muted-foreground">{totalEmployees - activeEmployees} tidak aktif</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Hadir Hari Ini</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{todayAttendance.filter(a => a.status === 'present').length}</div>
            <p className="text-xs text-muted-foreground">Tepat waktu</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Terlambat Hari Ini</CardTitle>
            <XCircle className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{todayAttendance.filter(a => a.status === 'late').length}</div>
            <p className="text-xs text-muted-foreground">Setelah jam 08:30</p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="employees" className="space-y-4">
        <TabsList>
          <TabsTrigger value="employees">Daftar Karyawan</TabsTrigger>
          <TabsTrigger value="attendance">Absensi</TabsTrigger>
        </TabsList>

        <TabsContent value="employees" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Daftar Karyawan</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Foto</TableHead>
                    <TableHead>Nama</TableHead>
                    <TableHead>Posisi</TableHead>
                    <TableHead>Kontak</TableHead>
                    <TableHead>Tanggal Mulai</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Aksi</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {employees.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                        Tidak ada karyawan. Klik "Tambah Karyawan" untuk menambahkan karyawan baru.
                      </TableCell>
                    </TableRow>
                  ) : (
                    employees.map((employee) => (
                      <TableRow key={employee.id}>
                        <TableCell>
                          <Avatar className="h-10 w-10">
                            <AvatarImage src={employee.photo_url || undefined} />
                            <AvatarFallback>
                              <User className="h-5 w-5" />
                            </AvatarFallback>
                          </Avatar>
                        </TableCell>
                        <TableCell className="font-medium">{employee.name}</TableCell>
                        <TableCell>
                          <Badge variant="outline">{employee.position || "-"}</Badge>
                        </TableCell>
                        <TableCell>
                          <div className="text-xs">
                            {employee.email && <div>{employee.email}</div>}
                            {employee.phone && <div className="text-muted-foreground">{employee.phone}</div>}
                          </div>
                        </TableCell>
                        <TableCell>
                          {employee.hire_date ? new Date(employee.hire_date).toLocaleDateString('id-ID') : "-"}
                        </TableCell>
                        <TableCell>
                          <Badge variant={employee.is_active ? "default" : "secondary"}>
                            {employee.is_active ? "Aktif" : "Tidak Aktif"}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button size="icon" variant="outline" onClick={() => handleEditClick(employee)}>
                              <Pencil className="h-4 w-4" />
                            </Button>
                            <Button 
                              size="icon" 
                              variant="destructive"
                              onClick={() => handleDeleteClick(employee.id)}
                              disabled={deleteEmployee.isPending}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="attendance" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Absensi Hari Ini</CardTitle>
              <p className="text-sm text-muted-foreground">
                {new Date().toLocaleDateString('id-ID', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
              </p>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nama Karyawan</TableHead>
                    <TableHead>Posisi</TableHead>
                    <TableHead>Jam Masuk</TableHead>
                    <TableHead>Jam Keluar</TableHead>
                    <TableHead>Durasi Kerja</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {todayAttendance.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                        Belum ada absensi hari ini
                      </TableCell>
                    </TableRow>
                  ) : (
                    todayAttendance.map((attendance) => (
                      <TableRow key={attendance.id}>
                        <TableCell className="font-medium">
                          {attendance.employees?.name || "-"}
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline">{attendance.employees?.position || "-"}</Badge>
                        </TableCell>
                        <TableCell>
                          {new Date(attendance.clock_in).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}
                        </TableCell>
                        <TableCell>
                          {attendance.clock_out 
                            ? new Date(attendance.clock_out).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })
                            : <span className="text-muted-foreground">Belum keluar</span>
                          }
                        </TableCell>
                        <TableCell>
                          {attendance.work_duration 
                            ? `${Math.floor(attendance.work_duration / 60)} jam ${attendance.work_duration % 60} menit`
                            : <span className="text-muted-foreground">-</span>
                          }
                        </TableCell>
                        <TableCell>
                          <Badge 
                            variant={
                              attendance.status === 'present' ? 'default' : 
                              attendance.status === 'late' ? 'destructive' : 
                              'secondary'
                            }
                          >
                            {attendance.status === 'present' ? 'Hadir' : 
                             attendance.status === 'late' ? 'Terlambat' : 
                             attendance.status === 'half_day' ? 'Setengah Hari' : 
                             'Tidak Hadir'}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Ringkasan Absensi</CardTitle>
              <p className="text-sm text-muted-foreground">
                Data akumulasi absensi per karyawan
              </p>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nama Karyawan</TableHead>
                    <TableHead>Total Hari Kerja</TableHead>
                    <TableHead>Hadir Tepat Waktu</TableHead>
                    <TableHead>Terlambat</TableHead>
                    <TableHead>Tidak Hadir</TableHead>
                    <TableHead>Persentase Kehadiran</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {attendanceSummary.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                        Belum ada data absensi
                      </TableCell>
                    </TableRow>
                  ) : (
                    attendanceSummary.map((summary) => (
                      <TableRow key={summary.employee_id}>
                        <TableCell className="font-medium">
                          {summary.employee_name}
                        </TableCell>
                        <TableCell>{summary.total_days}</TableCell>
                        <TableCell>
                          <span className="text-green-600 font-medium">{summary.present_days}</span>
                        </TableCell>
                        <TableCell>
                          <span className="text-orange-600 font-medium">{summary.late_days}</span>
                        </TableCell>
                        <TableCell>
                          <span className="text-red-600 font-medium">{summary.absent_days}</span>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <div className="text-sm font-medium">
                              {summary.total_days > 0 
                                ? `${((summary.present_days / summary.total_days) * 100).toFixed(1)}%` 
                                : '0%'}
                            </div>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
