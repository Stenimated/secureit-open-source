import { map } from "nanostores";
export const AlertStore = map<
  | AlertPropsError
  | AlertPropsActions
  | AlertPropsLink
  | AlertSuccess
  | AlertProps
>({
  title: "Alert",
  type: "info",
  visible: {
    enable: false,
  },
  description: "",
});
export interface AlertProps {
  title?: string;
  type: "info" | "warning" | "success" | "error";
  visible: {
    enable: boolean;
    timeout?: number;
  };
  description?: string;
}
export interface AlertPropsError extends AlertProps {
  type: "error";
  list: string[];
}
export interface AlertPropsActions extends AlertProps {
  type: "info" | "warning" | "success";
  actions: Array<{ Text: string; Callback: () => void }>;
}
export interface AlertPropsLink extends AlertProps {
  type: "info" | "warning" | "success";
  link: string;
}
export interface AlertSuccess extends AlertProps {
  type: "success";
}
