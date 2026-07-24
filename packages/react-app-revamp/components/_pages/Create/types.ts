export type FormSection = "duration" | "description" | "parameters" | "priceCurve" | "rewards";

export type CreateFormErrorLocation = "title" | FormSection | "signup";

export interface CreateFormError {
  location: CreateFormErrorLocation;
  message: string;
}
