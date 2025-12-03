import { ReactNode, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { FullPageLoader } from "@/components/LoadingSpinner";

interface ProtectedRouteProps {
  children: ReactNode;
  allowedRoles?: string[]; // roles yang diizinkan mengakses route ini
}

export function ProtectedRoute({ children, allowedRoles }: ProtectedRouteProps) {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isChecking, setIsChecking] = useState(true);
  const isLoggedIn = localStorage.getItem("isLoggedIn") === "true";
  const userRole = localStorage.getItem("userRole") || "kasir";

  useEffect(() => {
    if (!isLoggedIn) {
      navigate("/login", { replace: true });
      setIsChecking(false);
      return;
    }

    // Jika ada role restriction, cek apakah user memiliki akses
    if (allowedRoles && !allowedRoles.includes(userRole)) {
      toast({
        title: "Akses Ditolak",
        description: "Anda tidak memiliki izin untuk mengakses halaman ini.",
        variant: "destructive",
      });
      navigate("/", { replace: true });
      setIsChecking(false);
      return;
    }

    setIsChecking(false);
  }, [isLoggedIn, userRole, allowedRoles, navigate, toast]);

  if (isChecking) {
    return <FullPageLoader text="Memeriksa autentikasi..." />;
  }

  if (!isLoggedIn) {
    return null;
  }

  if (allowedRoles && !allowedRoles.includes(userRole)) {
    return null;
  }

  return <>{children}</>;
}
