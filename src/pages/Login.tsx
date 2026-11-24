import { useState } from "react";
import { useForm } from "react-hook-form";
import { Link, Navigate, useNavigate } from "react-router-dom";
import { z } from "zod";
import { loginRequest } from "../lib/adminApi";
import { useAuthStore } from "../stores/auth";
import { products } from "../data/products";

/** Mosaic "một đống giày": 12 ảnh thật đã kiểm chứng (4 Nike + 4 Adidas + 4 Puma). */
const MOSAIC_SLUGS = [
  "nike-air-jordan-1-retro-high",
  "adidas-ultraboost-light",
  "puma-suede-classic",
  "nike-air-force-1-07",
  "adidas-samba-og",
  "puma-rs-x",
  "nike-air-max-90",
  "adidas-superstar",
  "puma-palermo",
  "nike-dunk-low",
  "adidas-stan-smith",
  "puma-cali",
];

const MOSAIC_PRODUCTS = MOSAIC_SLUGS.map((slug) => products.find((p) => p.slug === slug)).filter(
  (p): p is NonNullable<typeof p> => p !== undefined,
);

const loginSchema = z.object({
  email: z.string().trim().email("Email chưa đúng định dạng, ví dụ admin@amazing.vn"),
  password: z.string().min(6, "Mật khẩu tối thiểu 6 ký tự"),
});

type LoginValues = z.infer<typeof loginSchema>;

const inputCls =
  "w-full rounded-xl border border-line bg-white px-3 py-2 text-sm focus:border-ink";

export default function Login() {
  const user = useAuthStore((s) => s.user);
  const login = useAuthStore((s) => s.login);
  const navigate = useNavigate();
  const [serverError, setServerError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors },
  } = useForm<LoginValues>({
    defaultValues: { email: "admin@amazing.vn", password: "123456" },
  });

  // Đã đăng nhập rồi thì vào thẳng trang quản trị.
  if (user?.role === "admin") return <Navigate to="/admin" replace />;

  const submit = async (values: LoginValues) => {
    const parsed = loginSchema.safeParse(values);
    if (!parsed.success) {
      for (const issue of parsed.error.issues) {
        const key = issue.path[0] as keyof LoginValues | undefined;
        if (key) setError(key, { message: issue.message });
      }
      return;
    }
    setServerError("");
    setSubmitting(true);
    try {
      const { user: loggedUser, token } = await loginRequest(
        parsed.data.email,
        parsed.data.password,
      );
      login(loggedUser, token);
      navigate(loggedUser.role === "admin" ? "/admin" : "/", { replace: true });
    } catch (err) {
      setServerError(err instanceof Error ? err.message : "Đăng nhập thất bại, thử lại sau.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <main className="mx-auto flex min-h-screen max-w-6xl items-center justify-center gap-10 px-6 py-12 lg:justify-start">
      <div className="w-full max-w-md shrink-0 rounded-3xl border border-line bg-white p-8 shadow-sm">
        <p className="font-display text-4xl uppercase tracking-wide">
          Amazing<span className="text-ember">.</span> Sneaker
        </p>
        <h1 className="mt-4 font-display text-2xl uppercase tracking-wide">Đăng nhập quản trị</h1>
        <p className="mt-1 text-sm text-ink-mute">
          Tài khoản demo: <strong>admin@amazing.vn</strong> / <strong>123456</strong>. Mọi email
          hợp lệ + mật khẩu từ 6 ký tự đều đăng nhập được (mock).
        </p>

        <form onSubmit={handleSubmit(submit)} className="mt-6 space-y-4">
          <div>
            <label htmlFor="login-email" className="text-sm font-semibold">
              Email
            </label>
            <input
              id="login-email"
              type="email"
              autoComplete="email"
              className={inputCls}
              {...register("email")}
            />
            {errors.email ? <p className="mt-1 text-sm text-red-600">{errors.email.message}</p> : null}
          </div>

          <div>
            <label htmlFor="login-password" className="text-sm font-semibold">
              Mật khẩu
            </label>
            <input
              id="login-password"
              type="password"
              autoComplete="current-password"
              className={inputCls}
              {...register("password")}
            />
            {errors.password ? (
              <p className="mt-1 text-sm text-red-600">{errors.password.message}</p>
            ) : null}
          </div>

          {serverError ? (
            <p role="alert" className="rounded-xl bg-red-50 px-3 py-2 text-sm text-red-700">
              {serverError}
            </p>
          ) : null}

          <button
            type="submit"
            disabled={submitting}
            className="w-full rounded-full bg-volt py-3 text-sm font-bold text-ink hover:bg-volt-deep focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink disabled:opacity-50"
          >
            {submitting ? "Đang đăng nhập…" : "Đăng nhập"}
          </button>
        </form>

        <Link to="/" className="mt-6 inline-block text-sm font-semibold text-ink-mute hover:text-ink focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink">
          ← Về trang chủ
        </Link>
      </div>

      {/* Panel hình bên phải — mosaic "một đống giày" từ ảnh thật của cửa hàng.
          Ẩn dưới màn lg để form nằm giữa trên mobile. */}
      <aside
        aria-label="Bộ sưu tập giày của cửa hàng"
        className="relative hidden flex-1 self-stretch overflow-hidden rounded-[2rem] lg:block"
      >
        <div className="grid h-full grid-cols-3 gap-3">
          {MOSAIC_PRODUCTS.map((product, i) => (
            <div
              key={product.id}
              className={`overflow-hidden rounded-2xl bg-[#EFEDE8] ${
                i % 2 === 0 ? "-rotate-1" : "rotate-1"
              }`}
            >
              <img
                src={product.colors[0]?.image ?? ""}
                alt={product.name}
                loading="lazy"
                className="h-full w-full object-cover"
              />
            </div>
          ))}
        </div>
        <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/75 via-black/40 to-transparent p-6 pt-20">
          <p className="font-display text-2xl uppercase text-white">12 đôi giày nổi bật</p>
          <p className="mt-1 text-sm text-white/85">
            Nike · Adidas · Puma — toàn bộ đều có sẵn trong cửa hàng.
          </p>
        </div>
      </aside>
    </main>
  );
}
