export type RolePermissionEntity = {
  id: number;
  role_id: number;
  menu_id: number;
  can_read: boolean;
  can_create: boolean;
  can_update: boolean;
  can_delete: boolean;
  can_report: boolean;
  created_at: Date;
  updated_at: Date;
};

export type RolePermissionWithRelationsRow = {
  id: number;
  role_id: number;
  menu_id: number;
  can_read: boolean | null;
  can_create: boolean | null;
  can_update: boolean | null;
  can_delete: boolean | null;
  can_report: boolean | null;
  created_at: Date;
  updated_at: Date;
  role_ref_id: number;
  role_code: string;
  role_name: string;
  menu_ref_id: number;
  menu_name: string;
  menu_path: string;
  menu_permission_path: string | null;
  menu_icon: string | null;
  menu_parent_id: number | null;
};
