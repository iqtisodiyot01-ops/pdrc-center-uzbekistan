import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Link, useLocation } from "wouter";
import { useTranslation } from "@/lib/i18n";
import { useRegisterUser } from "@workspace/api-client-react";
import { useAppStore } from "@/store/use-store";
import { useToast } from "@/hooks/use-toast";
import { motion } from "framer-motion";
import { Loader2, UserPlus } from "lucide-react";

const schema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  password: z.string().min(6),
  phone: z.string().min(9),
});

type FormValues = z.infer<typeof schema>;

export default function Register() {
  const { t } = useTranslation();
  const [, setLocation] = useLocation();
  const { setToken, setUser } = useAppStore();
  const { toast } = useToast();

  const { register, handleSubmit, formState: { errors } } = useForm<FormValues>({
    resolver: zodResolver(schema)
  });

  const mutation = useRegisterUser({
    mutation: {
      onSuccess: (data) => {
        setToken(data.token);
        setUser(data.user);
        toast({ title: t.auth.register_success, description: t.auth.register_success_desc });
        setLocation("/");
      },
      onError: (err: Error) => {
        toast({
          variant: "destructive",
          title: t.auth.register_error,
          description: err?.message || t.auth.register_error_desc
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
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 lg:p-12">
        <div className="w-full max-w-md">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="mb-8">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-xl bg-blue-700 flex items-center justify-center">
                  <UserPlus size={20} className="text-white" />
                </div>
                <div className="font-display font-bold text-base text-[#0f3460] tracking-wider">PDRC Uzbekistan</div>
              </div>
              <h1 className="text-3xl font-heading font-bold text-[#0f3460] mb-2 leading-tight">{t.auth.create_account}</h1>
              <p className="text-gray-500 text-sm">{t.auth.register_desc}</p>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-gray-700 uppercase tracking-wider">{t.auth.name}</label>
                <input
                  {...register("name")}
                  autoComplete="name"
                  className="w-full bg-white border border-gray-200 rounded-xl px-4 py-3.5 text-gray-900 placeholder-gray-400 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all"
                  placeholder="Ali Valiyev"
                />
                {errors.name && <p className="text-red-500 text-xs">{errors.name.message}</p>}
              </div>

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
                <label className="text-xs font-bold text-gray-700 uppercase tracking-wider">{t.auth.phone}</label>
                <input
                  {...register("phone")}
                  autoComplete="tel"
                  className="w-full bg-white border border-gray-200 rounded-xl px-4 py-3.5 text-gray-900 placeholder-gray-400 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all"
                  placeholder="+998 90 123 45 67"
                />
                {errors.phone && <p className="text-red-500 text-xs">{errors.phone.message}</p>}
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-gray-700 uppercase tracking-wider">{t.auth.password}</label>
                <input
                  {...register("password")}
                  type="password"
                  autoComplete="new-password"
                  className="w-full bg-white border border-gray-200 rounded-xl px-4 py-3.5 text-gray-900 placeholder-gray-400 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all"
                  placeholder="••••••••"
                />
                {errors.password && <p className="text-red-500 text-xs">{errors.password.message}</p>}
              </div>

              <button
                type="submit"
                disabled={mutation.isPending}
                className="w-full mt-3 bg-blue-700 text-white font-display font-bold uppercase tracking-widest py-4 rounded-xl shadow-md hover:bg-blue-800 hover:-translate-y-0.5 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {mutation.isPending ? <Loader2 className="animate-spin" size={20} /> : t.auth.submit_register}
              </button>
            </form>

            <p className="mt-8 text-center text-gray-500 text-sm">
              {t.auth.have_account}{" "}
              <Link href="/login" className="text-blue-700 font-semibold hover:underline">
                {t.auth.submit_login}
              </Link>
            </p>
          </motion.div>
        </div>
      </div>

      {/* Image Side */}
      <div className="hidden lg:block w-1/2 relative bg-[#0a2748] overflow-hidden">
        <img
          src={`${import.meta.env.BASE_URL}images/pdr-tools.png`}
          alt="Workshop Tools"
          className="w-full h-full object-cover opacity-30"
        />
        <div className="absolute inset-0 flex flex-col items-center justify-center z-10 px-12 text-center">
          <div className="font-display font-bold text-3xl text-white mb-4 leading-tight">PDR<br/>PROFESSIONAL</div>
          <p className="text-blue-200 text-sm max-w-xs leading-relaxed">PDR texnikasi bo'lib ko'ngil-bayroq kengaytirishni boshqarishni o'rganing</p>
        </div>
      </div>
    </div>
  );
}
