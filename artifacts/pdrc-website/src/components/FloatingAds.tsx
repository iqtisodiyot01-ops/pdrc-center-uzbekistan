import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { useAppStore } from "@/store/use-store";
import { X, ExternalLink } from "lucide-react";
import { useState, useEffect } from "react";

interface Advertisement {
  id: number;
  titleUz: string;
  titleEn: string;
  titleRu: string;
  imageUrl: string | null;
  linkUrl: string | null;
  isActive: boolean;
  sortOrder: number;
}

const DISMISSED_KEY = "pdrc_dismissed_ads";

function getDismissed(): number[] {
  try {
    return JSON.parse(localStorage.getItem(DISMISSED_KEY) || "[]");
  } catch {
    return [];
  }
}

function addDismissed(id: number) {
  const current = getDismissed();
  localStorage.setItem(DISMISSED_KEY, JSON.stringify([...current, id]));
}

export function FloatingAds() {
  const { lang } = useAppStore();
  const [dismissed, setDismissed] = useState<number[]>(getDismissed);
  const [currentIdx, setCurrentIdx] = useState(0);

  const { data: ads } = useQuery<Advertisement[]>({
    queryKey: ["advertisements"],
    queryFn: () => api.get<Advertisement[]>("/advertisements"),
    staleTime: 5 * 60 * 1000,
  });

  const visible = (ads || []).filter((a) => !dismissed.includes(a.id));

  useEffect(() => {
    if (visible.length === 0) return;
    const timer = setInterval(() => {
      setCurrentIdx((i) => (i + 1) % visible.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [visible.length]);

  if (!visible.length) return null;

  const idx = currentIdx % visible.length;
  const ad = visible[idx];

  const title = lang === "uz" ? ad.titleUz : lang === "ru" ? ad.titleRu : ad.titleEn;

  function dismiss(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    addDismissed(ad.id);
    setDismissed(getDismissed());
    setCurrentIdx(0);
  }

  const content = (
    <div className="flex flex-col items-center gap-1">
      <div className="relative w-16 h-16 rounded-full overflow-hidden border-2 border-white shadow-lg bg-gray-100">
        {ad.imageUrl ? (
          <img src={ad.imageUrl} alt={title} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center text-white font-bold text-lg">
            {title.charAt(0)}
          </div>
        )}
        <button
          onClick={dismiss}
          className="absolute -top-1 -right-1 w-5 h-5 bg-gray-700 hover:bg-red-500 text-white rounded-full flex items-center justify-center transition-colors shadow-md z-10"
          title="Yopish"
        >
          <X size={10} />
        </button>
      </div>
      <span className="text-[10px] font-medium text-gray-700 text-center max-w-[80px] leading-tight line-clamp-2">
        {title}
      </span>
      {visible.length > 1 && (
        <div className="flex gap-1 mt-0.5">
          {visible.map((_, i) => (
            <span key={i} className={`w-1 h-1 rounded-full transition-colors ${i === idx ? "bg-blue-600" : "bg-gray-300"}`} />
          ))}
        </div>
      )}
    </div>
  );

  return (
    <div className="fixed bottom-6 right-6 z-50">
      {ad.linkUrl ? (
        <a href={ad.linkUrl} target="_blank" rel="noopener noreferrer" className="block hover:scale-105 transition-transform">
          {content}
        </a>
      ) : (
        <div>{content}</div>
      )}
    </div>
  );
}
