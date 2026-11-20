import { useState } from "react";
import { useForm } from "react-hook-form";
import { Link, Navigate, useNavigate } from "react-router-dom";
import { z } from "zod";
import { loginRequest } from "../lib/adminApi";
import { useAuthStore } from "../stores/auth";

const loginSchema = z.object({
  email: z.string().trim().email("Email chưa đúng định dạng, ví dụ admin@amazing.vn"),
  password: z.string().min(6, "Mật khẩu tối thiểu 6 ký tự"),
});

type LoginValues = z.infer<typeof loginSchema>;

const inputCls =
  "w-full rounded-xl border border-line bg-white px-3 py-2 text-sm outline-none focus:border-ink";

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
    <main className="mx-auto flex min-h-screen max-w-6xl items-center px-6 py-12">
      <div className="w-full max-w-md rounded-3xl border border-line bg-white p-8 shadow-sm">
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
            className="w-full rounded-full bg-volt py-3 text-sm font-bold text-ink hover:bg-volt-deep disabled:opacity-50"
          >
            {submitting ? "Đang đăng nhập…" : "Đăng nhập"}
          </button>
        </form>

        <Link to="/" className="mt-6 inline-block text-sm font-semibold text-ink-mute hover:text-ink">
          ← Về trang chủ
        </Link>
      </div>
    </main>
  );
}
