import { Home, Briefcase, Calculator, Phone, Users, FileText, Handshake } from "lucide-react";

// Menú principal de navegación
export const navItems = [
  { label: "Inicio", path: "/", icon: Home, showInBottomNav: true },
  { label: "Nosotros", path: "/quienes-somos", icon: Users, showInBottomNav: false },
  { label: "Equipo", path: "/nuestro-equipo", icon: Users, showInBottomNav: false },
  { label: "Servicios", path: "/servicios", icon: Briefcase, showInBottomNav: true },
  { label: "Utilitarios", path: "/utilitarios", icon: Calculator, showInBottomNav: true },
  { label: "Contacto", path: "/contacto", icon: Phone, showInBottomNav: true },
];

// Submenú de Servicios
export const servicesItems = [
  { label: "Contabilidad Integral", path: "/servicios/contabilidad-integral", icon: Briefcase },
  { label: "Gestión de Remuneraciones", path: "/servicios/gestion-de-remuneraciones", icon: Users },
  { label: "Gestión Tributaria", path: "/servicios/gestion-tributaria", icon: FileText },
  { label: "Creación de Empresa", path: "/servicios/creacion-de-empresa", icon: Handshake },
  { label: "Auditoría y Control", path: "/servicios/auditoria-financiera", icon: Calculator },
];

// Submenú de Utilitarios
export const utilsItems = [
  { label: "Cálculo de IVA", path: "/utilitarios#calculadora-iva", icon: Calculator },
  { label: "Boleta de Honorarios", path: "/utilitarios#boleta-honorarios", icon: Calculator },
  { label: "Calculadora de Sueldo Líquido", path: "/utilitarios#calculadora-sueldos", icon: Calculator },
];
