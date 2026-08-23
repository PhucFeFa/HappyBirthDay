export function getFirebaseAuthErrorMessage(error: unknown): string {
  const err = error as { code?: string; message?: string };
  const code = err?.code || "";

  switch (code) {
    case "auth/operation-not-allowed":
      return "Chưa kích hoạt hình thức đăng nhập này trên Firebase Console. Vui lòng vào Firebase Console > Authentication > Sign-in method và Bật (Enable) 'Email/Password' hoặc 'Google'.";
    case "auth/email-already-in-use":
      return "Địa chỉ email này đã được đăng ký tài khoản trước đó. Vui lòng đăng nhập hoặc dùng email khác.";
    case "auth/invalid-email":
      return "Địa chỉ email không đúng định dạng.";
    case "auth/weak-password":
      return "Mật khẩu quá ngắn hoặc yếu. Vui lòng đặt mật khẩu tối thiểu 6 ký tự.";
    case "auth/user-not-found":
    case "auth/wrong-password":
    case "auth/invalid-credential":
      return "Email hoặc mật khẩu không chính xác. Vui lòng kiểm tra lại.";
    case "auth/too-many-requests":
      return "Bạn đã thử đăng nhập sai quá nhiều lần. Vui lòng chờ vài phút rồi thử lại.";
    case "auth/network-request-failed":
      return "Lỗi kết nối mạng. Vui lòng kiểm tra đường truyền Internet của bạn.";
    case "auth/popup-closed-by-user":
      return "Cửa sổ đăng nhập Google đã bị đóng trước khi hoàn tất.";
    case "auth/popup-blocked":
      return "Trình duyệt đã chặn cửa sổ đăng nhập Google (Pop-up). Vui lòng cho phép Pop-up để tiếp tục.";
    case "auth/unauthorized-domain":
      return "Tên miền hiện tại (localhost hoặc domain) chưa được cấp quyền trong Firebase Authentication > Settings > Authorized domains.";
    default:
      return err?.message || "Đã xảy ra lỗi khi xác thực. Vui lòng thử lại.";
  }
}
