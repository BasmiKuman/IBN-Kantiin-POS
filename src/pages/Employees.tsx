import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { UserCog, Plus, Award, Clock } from "lucide-react";

export default function Employees() {
  const employees = [
    {
      id: 1,
      name: "Andi Wijaya",
      role: "Manager",
      email: "andi@pos.com",
      phone: "08111222333",
      shift: "Pagi",
      performance: 95,
      sales: "Rp 45 Jt",
    },
    {
      id: 2,
      name: "Sari Kusuma",
      role: "Kasir",
      email: "sari@pos.com",
      phone: "08222333444",
      shift: "Siang",
      performance: 88,
      sales: "Rp 32 Jt",
    },
    {
      id: 3,
      name: "Bambang Setiawan",
      role: "Kasir",
      email: "bambang@pos.com",
      phone: "08333444555",
      shift: "Malam",
      performance: 92,
      sales: "Rp 38 Jt",
    },
    {
      id: 4,
      name: "Lina Hartati",
      role: "Staff Gudang",
      email: "lina@pos.com",
      phone: "08444555666",
      shift: "Pagi",
      performance: 85,
      sales: "-",
    },
  ];

  const getPerformanceBadge = (score: number) => {
    if (score >= 90) return <Badge className="bg-success text-success-foreground">Excellent</Badge>;
    if (score >= 80) return <Badge className="bg-primary text-primary-foreground">Good</Badge>;
    return <Badge className="bg-warning text-warning-foreground">Average</Badge>;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Manajemen Karyawan</h2>
          <p className="text-muted-foreground">Kelola tim dan performa karyawan</p>
        </div>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Tambah Karyawan
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Karyawan</CardTitle>
            <UserCog className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">24</div>
            <p className="text-xs text-muted-foreground">8 kasir, 16 staff</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Hadir Hari Ini</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">22</div>
            <p className="text-xs text-muted-foreground">2 izin/sakit</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg. Performance</CardTitle>
            <Award className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">87%</div>
            <p className="text-xs text-success">+5% dari bulan lalu</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Komisi</CardTitle>
            <Award className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">Rp 8.5 Jt</div>
            <p className="text-xs text-muted-foreground">Bulan ini</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Daftar Karyawan</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nama</TableHead>
                <TableHead>Posisi</TableHead>
                <TableHead>Kontak</TableHead>
                <TableHead>Shift</TableHead>
                <TableHead>Performance</TableHead>
                <TableHead>Sales/Komisi</TableHead>
                <TableHead className="text-right">Aksi</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {employees.map((employee) => (
                <TableRow key={employee.id}>
                  <TableCell className="font-medium">{employee.name}</TableCell>
                  <TableCell>
                    <Badge variant="outline">{employee.role}</Badge>
                  </TableCell>
                  <TableCell>
                    <div className="text-xs">
                      <div>{employee.email}</div>
                      <div className="text-muted-foreground">{employee.phone}</div>
                    </div>
                  </TableCell>
                  <TableCell>{employee.shift}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      {getPerformanceBadge(employee.performance)}
                      <span className="text-sm">{employee.performance}%</span>
                    </div>
                  </TableCell>
                  <TableCell>{employee.sales}</TableCell>
                  <TableCell className="text-right">
                    <Button size="sm" variant="outline">
                      Detail
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Top Performers Bulan Ini</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {[
              { name: "Andi Wijaya", sales: "Rp 45 Jt", score: 95 },
              { name: "Bambang Setiawan", sales: "Rp 38 Jt", score: 92 },
              { name: "Sari Kusuma", sales: "Rp 32 Jt", score: 88 },
            ].map((performer, index) => (
              <div key={index} className="flex items-center justify-between rounded-lg border p-3">
                <div className="flex items-center gap-3">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground font-bold text-sm">
                    {index + 1}
                  </div>
                  <div>
                    <p className="font-medium">{performer.name}</p>
                    <p className="text-xs text-muted-foreground">Performance: {performer.score}%</p>
                  </div>
                </div>
                <p className="font-semibold">{performer.sales}</p>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Jadwal Shift Hari Ini</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {[
              { shift: "Pagi (08:00-16:00)", employees: 8, color: "bg-secondary" },
              { shift: "Siang (14:00-22:00)", employees: 9, color: "bg-primary" },
              { shift: "Malam (20:00-04:00)", employees: 5, color: "bg-accent" },
            ].map((shift, index) => (
              <div key={index} className="rounded-lg border p-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`h-3 w-3 rounded-full ${shift.color}`} />
                    <span className="font-medium">{shift.shift}</span>
                  </div>
                  <span className="text-sm text-muted-foreground">{shift.employees} karyawan</span>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
