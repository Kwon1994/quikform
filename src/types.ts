export type FieldType = "text" | "textarea" | "email" | "select" | "number" | "checkbox";

export interface FormField {
  id: string;
  type: FieldType;
  label: string;
  required: boolean;
  options: string[];
}

export interface Form {
  id: string;
  title: string;
  fields: FormField[];
  created_at: string;
}