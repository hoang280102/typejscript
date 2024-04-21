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
export enum EncodingStatus {
  Pending, // HANG DOI
  Processing, // dang encode
  Success, // thanh cong
  Faild // that bai
}
export enum TweetAudience {
  Everyone,
  TwitterCircle
}
export enum TweetType {
  Tweet,
  Retweet,
  Comment,
  QuoteTweet
}
