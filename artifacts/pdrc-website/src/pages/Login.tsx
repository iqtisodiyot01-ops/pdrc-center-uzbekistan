import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Link, useLocation } from "wouter";
import { useTranslation } from "@/lib/i18n";
import { useLoginUser } from "@workspace/api-client-react";
import { useAppStore } from "@/store/use-store";
import { useToast } from "@/hooks/use-toast";
import { motion } from "framer-motion";
import { Loader2, Lock } from "lucide-react";

const schema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});

type FormValues = z.infer<typeof schema>;

export default function Login() {
  const { t } = useTranslation();
  const [, setLocation] = useLocation();
  const { setToken, setUser } = useAppStore();
  const { toast } = useToast();

  const { register, handleSubmit, formState: { errors } } = useForm<FormValues>({
    resolver: zodResolver(schema)
  });

  const mutation = useLoginUser({
    mutation: {
      onSuccess: (data) => {
        setToken(data.token);
        setUser(data.user);
        toast({ title: t.auth.login_success, description: t.auth.login_success_desc });
        if (data.user.role === "admin" || data.user.role === "superadmin") {
          setLocation("/admin");
        } else {
          setLocation("/");
        }
      },
      onError: (err: Error) => {
        toast({
          variant: "destructive",
          title: t.auth.login_error,
          description: err?.message || t.auth.login_error_desc
        });
      }
    }
  });

  const onSubmit = (data: FormValues) => {
    mutation.mutate({ data });
  };

  return (
    <div className="min-h-screen flex bg-gray-50">
      {/* Form Side */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 lg:p-16">
        <div className="w-full max-w-md">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            {/* Logo */}
            <div className="mb-10">
              <div className="flex items-center gap-3 mb-6">
                <img
                  src={`${import.meta.env.BASE_URL}images/logo-icon.png`}
                  alt="PDRC Logo"
                  className="w-14 h-14 object-contain"
                  onError={(e) => { e.currentTarget.style.display = 'none'; }}
                />
                <div>
                  <div className="font-display font-bold text-xl text-[#0f3460] tracking-wider">PDRC</div>
                  <div className="text-xs text-gray-400 tracking-widest uppercase">Uzbekistan</div>
                </div>
              </div>
              <h1 className="text-3xl font-heading font-bold text-[#0f3460] mb-2 leading-tight">{t.auth.welcome}</h1>
              <p className="text-gray-500 text-sm">{t.auth.welcome_back_desc}</p>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-gray-700 uppercase tracking-wider">{t.auth.email}</label>
                <input
                  {...register("email")}
                  type="email"
                  autoComplete="email"
                  className="w-full bg-white border border-gray-200 rounded-xl px-4 py-3.5 text-gray-900 placeholder-gray-400 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all"
                  placeholder="name@example.com"
                />
                {errors.email && <p className="text-red-500 text-xs">{errors.email.message}</p>}
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-gray-700 uppercase tracking-wider">{t.auth.password}</label>
                <input
                  {...register("password")}
                  type="password"
                  autoComplete="current-password"
                  className="w-full bg-white border border-gray-200 rounded-xl px-4 py-3.5 text-gray-900 placeholder-gray-400 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all"
                  placeholder="••••••••"
                />
                {errors.password && <p className="text-red-500 text-xs">{errors.password.message}</p>}
              </div>

              <button
                type="submit"
                disabled={mutation.isPending}
                className="w-full bg-blue-700 text-white font-display font-bold uppercase tracking-widest py-4 rounded-xl shadow-md hover:bg-blue-800 hover:-translate-y-0.5 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 mt-2"
              >
                {mutation.isPending
                  ? <Loader2 className="animate-spin" size={20} />
                  : <><Lock size={16} /> {t.auth.submit_login}</>
                }
              </button>
            </form>

            <p className="mt-8 text-center text-gray-500 text-sm">
              {t.auth.no_account}{" "}
              <Link href="/register" className="text-blue-700 font-semibold hover:underline">
                {t.auth.create_account}
              </Link>
            </p>
          </motion.div>
        </div>
      </div>

      {/* Image Side */}
      <div className="hidden lg:block w-1/2 relative bg-[#0a2748] overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-gray-50/30 via-transparent to-transparent z-10" />
        <img
          src={`${import.meta.env.BASE_URL}images/hero-workshop.png`}
          alt="Workshop"
          className="w-full h-full object-cover opacity-40"
        />
        <div className="absolute inset-0 flex flex-col items-center justify-center z-20 px-12 text-center">
          <div className="font-display font-bold text-4xl text-white mb-4 leading-tight">PAINTLESS<br/>DENT REPAIR</div>
          <p className="text-blue-200 text-sm max-w-xs leading-relaxed">PDR Center Uzbekistan — professional PDR xizmatlari va o'quv markazi</p>
        </div>
      </div>
    </div>
  );
}
