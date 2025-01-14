export interface ILoginResponse {
  user: {
    id: string;
    email: string;
    name: string;
  };
  token: string;
}
