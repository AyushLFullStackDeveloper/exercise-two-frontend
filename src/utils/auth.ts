export interface Role {
  id: number;
  role_id: string | number;
  name: string;
  logo?: string;
}

export interface Institute {
  id: number;
  institute_id: string | number;
  tenant_id: number;
  name: string;
  code?: string;
  type?: string;
  location?: string;
  city?: string;
  state?: string;
  logo?: string;
  roles: any[];
}

export interface User {
  id: number;
  full_name: string;
  email: string;
  password?: string;
  institutes_count?: number;
  roles_count?: number;
  institutes?: Institute[];
  single_institute?: (Institute & { role?: Role }) | null;
  primary_context?: {
    institute: Institute;
    role: Role;
  } | null;
  target_route?: string;
  access_token?: string;
  pre_context_token?: string;
}

interface AuthFlowResult {
  error?: string;
  route?: string;
}

export const handleUserFlow = (user: User | null, target_route?: string): AuthFlowResult => {
  if (!user) {
    return { error: "Incorrect credentials" };
  }

  // Use backend provided target_route if available
  if (target_route) {
    // If it's a dashboard redirect, we might already have the data set or need to set it
    if (target_route === "/dashboard" && user.single_institute && user.single_institute.role) {
        localStorage.setItem("selectedInstitute", JSON.stringify(user.single_institute));
        localStorage.setItem("selectedRole", JSON.stringify(user.single_institute.role));
    } else if (target_route === "/select-role" && user.single_institute) {
        localStorage.setItem("selectedInstitute", JSON.stringify(user.single_institute));
    }
    return { route: target_route };
  }

  // Legacy fallback (should ideally not be reached with backend-driven logic)
  const instCount = user.institutes_count !== undefined ? user.institutes_count : (user.institutes?.length || 0);

  if (instCount === 0) {
    return { error: "Not associated with any institute" };
  }

  if (instCount === 1 && user.single_institute) {
    localStorage.setItem("selectedInstitute", JSON.stringify(user.single_institute));
    if (user.roles_count === 1 && user.single_institute.role) {
        localStorage.setItem("selectedRole", JSON.stringify(user.single_institute.role));
        return { route: "/dashboard" };
    }
    return { route: "/select-role" };
  }

  if (instCount > 1) {
    return { route: "/select-institute" };
  }

  return { route: "/select-institute" };
};