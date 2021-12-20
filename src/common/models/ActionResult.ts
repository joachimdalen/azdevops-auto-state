export interface ActionResult<T> {
  success: boolean;
  message?: string;
  data?: T;
}
