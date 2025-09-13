const express = require("express");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const cors = require("cors");

const app = express();
app.use(cors());
app.use(bodyParser.json());

// 📌 الاتصال بقاعدة البيانات MongoDB (لازم تكون مثبتة عندك ومشغلة)
mongoose.connect("mongodb://localhost:27017/clothesShare", {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

// 🧵 نموذج الملابس
const PostSchema = new mongoose.Schema({
  title: String,
  description: String,
  owner: String,
  status: { type: String, default: "pending" }, // pending | approved | rejected
});
const Post = mongoose.model("Post", PostSchema);

// 📝 إضافة منشور جديد (ينتظر موافقة الأدمن)
app.post("/posts", async (req, res) => {
  const newPost = new Post(req.body);
  await newPost.save();
  res.json({ message: "تم إرسال المنشور للمراجعة" });
});

// 📋 عرض كل المنشورات الموافق عليها فقط
app.get("/posts", async (req, res) => {
  const posts = await Post.find({ status: "approved" });
  res.json(posts);
});

// 👑 كلمة السر الخاصة بالأدمن (غيّرها لقيمة خاصة بك)
const ADMIN_PASSWORD = "Nadjad 321";

// ✅ تسجيل دخول الأدمن
app.post("/admin/login", (req, res) => {
  const { password } = req.body;
  if (password === ADMIN_PASSWORD) {
    res.json({ success: true });
  } else {
    res.status(401).json({ success: false, message: "كلمة السر غير صحيحة" });
  }
});

// 📋 لوحة تحكم الأدمن: عرض كل المنشورات
app.get("/admin/posts", async (req, res) => {
  const posts = await Post.find();
  res.json(posts);
});

// 👍 موافقة على منشور
app.put("/admin/approve/:id", async (req, res) => {
  await Post.findByIdAndUpdate(req.params.id, { status: "approved" });
  res.json({ message: "تمت الموافقة على المنشور" });
});

// ❌ رفض منشور
app.put("/admin/reject/:id", async (req, res) => {
  await Post.findByIdAndUpdate(req.params.id, { status: "rejected" });
  res.json({ message: "تم رفض المنشور" });
});

// 🚀 تشغيل السيرفر
app.listen(5000, () => {
  console.log("🚀 الخادم يعمل على http://localhost:5000");
});
