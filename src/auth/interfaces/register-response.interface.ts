export interface IRegisterResponse {
  user: {
    id: string;
    email: string;
    name: string;
  };
  token: string;
}
