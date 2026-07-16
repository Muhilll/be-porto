export type NavigationPermission = {
  can_read: boolean;
  can_create: boolean;
  can_update: boolean;
  can_delete: boolean;
  can_report: boolean;
};

export type NavigationItem = {
  id: number;
  name: string;
  path: string | null;
  icon: string | null;
  is_visible: boolean | null;
  parent_id: number | null;
  permissions: NavigationPermission;
  children: NavigationItem[];
};

export type UserWithRelationsRow = {
  id: number;
  email: string;
  name: string;
  role_id: number;
  created_at: Date;
  updated_at: Date;
  role_ref_id: number;
  role_code: string;
  role_name: string;
};

export type PublicUser = {
  id: number;
  email: string;
  name: string;
  role_id: number;
  created_at: Date;
  updated_at: Date;
  role: {
    id: number;
    code: string;
    name: string;
  };
};
