/**
 * Hàm sao chép văn bản vào Clipboard tương thích 100% mọi trình duyệt (Desktop, iOS Safari, Android Webview)
 */
export async function copyTextToClipboard(text: string): Promise<boolean> {
  // 1. Thử dùng Clipboard API hiện đại
  if (typeof navigator !== "undefined" && navigator.clipboard && navigator.clipboard.writeText) {
    try {
      await navigator.clipboard.writeText(text);
      return true;
    } catch (e) {
      console.warn("navigator.clipboard failed, trying fallback:", e);
    }
  }

  // 2. Fallback cho iOS Safari và Webview
  if (typeof document !== "undefined") {
    try {
      const textArea = document.createElement("textarea");
      textArea.value = text;
      textArea.style.position = "fixed";
      textArea.style.top = "0";
      textArea.style.left = "0";
      textArea.style.width = "2em";
      textArea.style.height = "2em";
      textArea.style.padding = "0";
      textArea.style.border = "none";
      textArea.style.outline = "none";
      textArea.style.boxShadow = "none";
      textArea.style.background = "transparent";
      textArea.setAttribute("readonly", "");

      document.body.appendChild(textArea);
      textArea.focus();
      textArea.select();
      textArea.setSelectionRange(0, 99999);

      const successful = document.execCommand("copy");
      document.body.removeChild(textArea);
      return successful;
    } catch (err) {
      console.error("ExecCommand copy fallback error:", err);
    }
  }

  return false;
}

/**
 * Tạo nội dung tin nhắn mời bạn bè kèm đường link đầy đủ
 */
export function getInviteMessage({
  recipientName,
  shareLink,
  shareTitle,
}: {
  recipientName: string;
  shareLink: string;
  shareTitle?: string | null;
}): string {
  const name = recipientName.trim() || "người ấy";
  const title = shareTitle?.trim() || `💌 Gửi lời chúc sinh nhật bí mật đến ${name}! 🎂✨`;

  return `${title}\nCùng viết những phong bì lời chúc yêu thương bí mật dành tặng ${name} nhé! 🎉🎁\n👉 Nhấn vào đây để viết thiệp: ${shareLink}`;
}

/**
 * Chia sẻ trực tiếp qua Web Share API nếu thiết bị hỗ trợ
 */
export async function shareLinkOrCopy({
  title,
  text,
  url,
}: {
  title: string;
  text: string;
  url: string;
}): Promise<{ shared: boolean; copied: boolean }> {
  if (typeof navigator !== "undefined" && navigator.share) {
    try {
      await navigator.share({
        title,
        text,
        url,
      });
      return { shared: true, copied: false };
    } catch (e) {
      // User cancelled share or not supported
      if ((e as Error).name !== "AbortError") {
        console.warn("navigator.share error:", e);
      }
    }
  }

  const fullMsg = `${text}\n${url}`;
  const copied = await copyTextToClipboard(fullMsg);
  return { shared: false, copied };
}
