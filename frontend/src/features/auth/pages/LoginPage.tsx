import { useState } from "react";
import { useForm } from "@tanstack/react-form";
import { Navigate, NavLink, useNavigate } from "react-router-dom";
import { apiErrorMessage } from "@/shared/api/api";
import { useAuth } from "../hooks/useAuth";
import { AuthLayout } from "../components/AuthLayout";

export function LoginPage() {
  const { user, checking, login } = useAuth();
  const navigate = useNavigate();
  const [error, setError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);

  const form = useForm({
    defaultValues: { username: "", password: "" },
    onSubmit: async ({ value }) => {
      setError(null);
      try {
        const loggedInUser = await login(value.username, value.password);
        navigate(
          loggedInUser.role === "admin" ? "/admin/categorias" : "/",
          { replace: true },
        );
      } catch (err) {
        setError(apiErrorMessage(err));
      }
    },
  });

  if (checking) return null;

  if (user) {
    return (
      <Navigate
        to={user.role === "admin" ? "/admin/categorias" : "/"}
        replace
      />
    );
  }

  return (
    <AuthLayout page="login">
      <form
        className="space-y-4"
        onSubmit={(event) => {
          event.preventDefault();
          void form.handleSubmit();
        }}
      >
        {error && (
          <p
            role="alert"
            className="rounded-lg bg-red-50 p-3 text-sm text-red-700 dark:bg-red-950/40 dark:text-red-200"
          >
            {error}
          </p>
        )}

        <form.Field
          name="username"
          validators={{
            onChange: ({ value }) =>
              value.trim() ? undefined : "Ingrese su nombre de usuario",
          }}
        >
          {(field) => (
            <label className="block text-sm font-semibold">
              Nombre de usuario
              <input
                type="text"
                autoComplete="username"
                placeholder="Ingresá tu nombre de usuario"
                className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-4 py-3 font-normal outline-none transition focus:border-orange-500 focus:ring-2 focus:ring-orange-100 dark:border-slate-700 dark:bg-slate-900 dark:focus:ring-orange-950"
                value={field.state.value}
                onChange={(event) => field.handleChange(event.target.value)}
              />
              {field.state.meta.errors.length > 0 && (
                <span className="mt-1 block text-sm text-red-700 dark:text-red-300">
                  {field.state.meta.errors.join(", ")}
                </span>
              )}
            </label>
          )}
        </form.Field>

        <form.Field
          name="password"
          validators={{
            onChange: ({ value }) =>
              value.length >= 8
                ? undefined
                : "La contraseña debe tener al menos 8 caracteres",
          }}
        >
          {(field) => (
            <label className="block text-sm font-semibold">
              Contraseña
              <span className="relative mt-2 block">
                <input
                  type={showPassword ? "text" : "password"}
                  autoComplete="current-password"
                  placeholder="Ingresá tu contraseña"
                  className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 pr-12 font-normal outline-none transition focus:border-orange-500 focus:ring-2 focus:ring-orange-100 dark:border-slate-700 dark:bg-slate-900 dark:focus:ring-orange-950"
                  value={field.state.value}
                  onChange={(event) => field.handleChange(event.target.value)}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((current) => !current)}
                  className="absolute inset-y-0 right-3 text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-white"
                  aria-label={
                    showPassword ? "Ocultar contraseña" : "Mostrar contraseña"
                  }
                >
                  {showPassword ? "◉" : "◎"}
                </button>
              </span>
              {field.state.meta.errors.length > 0 && (
                <span className="mt-1 block text-sm text-red-700 dark:text-red-300">
                  {field.state.meta.errors.join(", ")}
                </span>
              )}
            </label>
          )}
        </form.Field>

        <button
          className="flex w-full items-center justify-center gap-2 rounded-xl bg-orange-600 px-4 py-3.5 font-bold text-white transition hover:bg-orange-700"
          type="submit"
        >
          Ingresar <span aria-hidden="true">→</span>
        </button>
      </form>

      <p className="mt-4 text-center text-sm text-slate-600 dark:text-slate-300">
        ¿Primera vez por acá?{" "}
        <NavLink
          to="/register"
          className="font-bold text-orange-700 hover:underline dark:text-orange-300"
        >
          Creá tu cuenta
        </NavLink>
      </p>
    </AuthLayout>
  );
}