export interface IAuthResponse<T = null> {
  status: boolean;
  message: string;
  data: T | null;
}
