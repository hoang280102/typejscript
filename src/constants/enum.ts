export enum UserVerifyStatus {
  Unverified, //chua xac thuc email , default =0
  Verified, //da xac thuc email
  Banned // bi khoa
}
export enum TokenType {
  AccessToken,
  RefreshToken,
  ForgotPasswordToken,
  EmailVerifyToken
}

export enum MediaType {
  Image,
  Video
}
