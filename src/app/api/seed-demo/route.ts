import { NextResponse } from "next/server";
import { createCard, addWish } from "@/lib/db";
import { generateSlug, generateToken } from "@/lib/utils";

const SAMPLE_NAMES = [
  "Hoàng Nam", "Mai Linh", "Bảo Châu", "Quốc Tuấn", "Thu Trang",
  "Minh Đức", "Khánh Vy", "Gia Bảo", "Phương Linh", "Hữu Phước",
  "Thùy Dương", "Thanh Tùng", "Ngọc Hân", "Đức Anh", "Bích Ngọc",
  "Hải Đăng", "Quỳnh Anh", "Nhật Minh", "Thảo My", "Người gửi bí mật",
  "Tấn Tài", "Mỹ Duyên", "Văn Hùng", "Yến Nhi", "Thành Long",
  "Kim Ngân", "Trọng Hiếu", "Bảo Trâm", "Tiến Dũng", "Hồng Nhung",
];

const WISH_TEMPLATES = [
  "Chúc bạn tuổi mới luôn rực rỡ, ngập tràn tiếng cười và vạn sự như ý nhé! 🎉🎂",
  "Happy Birthday! Chúc mọi ước mơ của cậu trong năm nay đều trở thành hiện thực nha ✨💖",
  "Chúc bạn một ngày sinh nhật thật ấm áp, hạnh phúc và nhận được thật nhiều quà dễ thương 🎁🎈",
  "Thêm một tuổi mới thật bùng nổ, luôn giữ nụ cười tươi tắn trên môi nhé cô gái! 🌸🥰",
  "Chúc mừng sinh nhật! Chúc cậu luôn may mắn, mạnh khỏe và đạt được mọi mục tiêu đề ra 🚀🥳",
  "Tuổi mới thật nhiều sức khỏe, xinh đẹp và luôn là niềm vui của mọi người nhé! 🍰✨",
  "Sinh nhật vui vẻ nha! Chúc bạn mãi luôn trẻ trung, yêu đời và hạnh phúc! 🎊🥂",
  "Happy Birthday! Mong những điều tuyệt vời nhất sẽ luôn đồng hành cùng bạn trên mọi chặng đường! 💌🌻",
  "Chúc bạn có một ngày sinh nhật thật đáng nhớ bên gia đình và những người thân yêu! 🎂🌟",
  "Tuổi mới chúc bạn gặt hái thêm nhiều thành công mới và luôn tràn đầy năng lượng tích cực! 🎈💖",
];

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const count = parseInt(searchParams.get("count") || "100", 10);
    const requestedSlug = searchParams.get("slug");
    const totalWishes = Math.min(100, Math.max(5, count)); // Mặc định 100 thư

    const slug = requestedSlug?.trim() ? requestedSlug.trim() : "demo-" + generateSlug();
    const creatorToken = generateToken();

    // Reveal date in the past so it is revealed immediately
    const pastDate = new Date(Date.now() - 24 * 60 * 60 * 1000);

    const SAMPLE_IMAGES = [
      "https://images.unsplash.com/photo-1513151233558-d860c5398176?w=800&auto=format&fit=crop&q=80",
      "https://images.unsplash.com/photo-1530103862676-de8c9debad1d?w=800&auto=format&fit=crop&q=80",
      "https://images.unsplash.com/photo-1464349095431-e9a21285b5f3?w=800&auto=format&fit=crop&q=80",
      "https://images.unsplash.com/photo-1527529482837-4698179dc6ce?w=800&auto=format&fit=crop&q=80",
    ];

    const card = await createCard({
      slug,
      creatorToken,
      recipientName: "Phương Anh",
      revealAt: pastDate,
      theme: "pink",
      description: "Chúc mừng sinh nhật Phương Anh! Chúc cậu luôn rạng rỡ và nhận được tất cả tình yêu thương từ mọi người.",
      imageUrl: SAMPLE_IMAGES[0],
      imageUrls: SAMPLE_IMAGES,
      celebrationEffect: "flowers",
      shareTitle: "💌 Sinh nhật 20 tuổi của Phương Anh 💖",
      shareDescription: "Cùng viết những lời chúc yêu thương bí mật dành tặng Phương Anh trong ngày sinh nhật nhé! 🎉🎂",
    });

    // Tạo danh sách 100 lời chúc
    const wishesToInsert = [];
    for (let i = 0; i < totalWishes; i++) {
      const name = SAMPLE_NAMES[i % SAMPLE_NAMES.length];
      const template = WISH_TEMPLATES[i % WISH_TEMPLATES.length];
      wishesToInsert.push({
        cardId: card.id,
        authorName: `${name} ${i > 29 ? `(#${i + 1})` : ""}`,
        message: `${template} (Lời chúc số ${i + 1})`,
      });
    }

    // Chèn lời chúc theo batch
    await Promise.all(wishesToInsert.map((w) => addWish(w)));

    return NextResponse.json({
      success: true,
      totalWishes,
      slug,
      creatorToken,
      viewUrl: `/thiep/${slug}/xem?key=${creatorToken}`,
      wishUrl: `/thiep/${slug}`,
    });
  } catch (error) {
    console.error("Seed error:", error);
    return NextResponse.json({ error: "Lỗi tạo thiệp 100 thư" }, { status: 500 });
  }
}
