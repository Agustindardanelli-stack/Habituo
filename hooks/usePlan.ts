import { useState } from "react";

export function usePlan() {
  const [loading, setLoading] = useState(false);

  const startUpgrade = async () => {
    try {
      setLoading(true);

      const res = await fetch("/api/mercadopago/checkout", {
        method: "POST",
        credentials: "include", // 🔥 ESTO ES CLAVE
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Error en el checkout");
      }

      if (data.url) {
        window.location.href = data.url;
      }
    } catch (error: any) {
      console.error(error);
      alert(error.message);
    } finally {
      setLoading(false);
    }
  };

  return {
    startUpgrade,
    loading,
  };
}