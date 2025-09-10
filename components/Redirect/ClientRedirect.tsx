"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

const ClientRedirect = ({ to, delay }: { to: string; delay: number }) => {
  const router = useRouter();

  useEffect(() => {
    const timeout = setTimeout(() => {
      router.push(to);
    }, delay);

    return () => clearTimeout(timeout);
  }, [router, to, delay]);

  return null; 
};

export default ClientRedirect;
