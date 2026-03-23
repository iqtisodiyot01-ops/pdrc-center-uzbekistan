import { useState } from "react";
import { Link } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { useAppStore } from "@/store/use-store";
import { Calendar, ChevronRight, BookOpen, Loader2 } from "lucide-react";

interface Article {
  id: number;
  titleUz: string;
  titleEn: string;
  titleRu: string;
  contentUz: string;
  contentEn: string;
  contentRu: string;
  imageUrl: string | null;
  isPublished: boolean;
  createdAt: string;
}

interface ArticlesResponse {
  items?: Article[];
}

function getTitle(a: Article, lang: string) {
  return lang === "uz" ? a.titleUz : lang === "ru" ? a.titleRu : a.titleEn;
}

function getContent(a: Article, lang: string) {
  return lang === "uz" ? a.contentUz : lang === "ru" ? a.contentRu : a.contentEn;
}

export default function Articles() {
  const { lang } = useAppStore();
  const [expandedId, setExpandedId] = useState<number | null>(null);

  const { data, isLoading } = useQuery<ArticlesResponse | Article[]>({
    queryKey: ["articles", lang],
    queryFn: () => api.get("/articles"),
  });

  const articles: Article[] = Array.isArray(data)
    ? data
    : (data as ArticlesResponse)?.items ?? [];

  const published = articles.filter((a) => a.isPublished !== false);

  const l = {
    uz: { title: "Blog", subtitle: "Foydali maqolalar va yangiliklar", loading: "Yuklanmoqda...", noArticles: "Hozircha maqolalar yo'q", readMore: "Batafsil o'qish", hideText: "Yig'ish" },
    ru: { title: "Блог", subtitle: "Полезные статьи и новости", loading: "Загрузка...", noArticles: "Статьи отсутствуют", readMore: "Читать далее", hideText: "Свернуть" },
    en: { title: "Blog", subtitle: "Useful articles and news", loading: "Loading...", noArticles: "No articles yet", readMore: "Read more", hideText: "Collapse" },
  }[lang] ?? { title: "Blog", subtitle: "", loading: "Loading...", noArticles: "No articles", readMore: "Read more", hideText: "Collapse" };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-[#0f3460] text-white py-12 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 bg-white/10 rounded-full px-4 py-1.5 mb-4">
            <BookOpen size={16} />
            <span className="text-sm font-medium">{l.title}</span>
          </div>
          <h1 className="text-3xl font-bold mb-2">{l.title}</h1>
          <p className="text-blue-200 text-sm">{l.subtitle}</p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-10">
        {isLoading ? (
          <div className="flex justify-center py-16">
            <Loader2 size={40} className="animate-spin text-blue-600" />
          </div>
        ) : published.length === 0 ? (
          <div className="text-center py-16 text-gray-500">
            <BookOpen size={48} className="mx-auto mb-4 text-gray-300" />
            <p className="text-lg font-medium">{l.noArticles}</p>
          </div>
        ) : (
          <div className="space-y-6">
            {published.map((article) => {
              const isExpanded = expandedId === article.id;
              const content = getContent(article, lang);
              const shortContent = content.slice(0, 300);
              const hasMore = content.length > 300;

              return (
                <article key={article.id} className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow">
                  {article.imageUrl && (
                    <img
                      src={article.imageUrl}
                      alt={getTitle(article, lang)}
                      className="w-full h-52 object-cover"
                    />
                  )}
                  <div className="p-6">
                    <div className="flex items-center gap-2 text-xs text-gray-400 mb-3">
                      <Calendar size={12} />
                      <span>{new Date(article.createdAt).toLocaleDateString(lang === "uz" ? "uz-UZ" : lang === "ru" ? "ru-RU" : "en-US")}</span>
                    </div>
                    <h2 className="text-xl font-bold text-gray-900 mb-3">{getTitle(article, lang)}</h2>
                    <p className="text-gray-600 text-sm leading-relaxed">
                      {isExpanded ? content : shortContent}
                      {!isExpanded && hasMore && "..."}
                    </p>
                    {hasMore && (
                      <button
                        onClick={() => setExpandedId(isExpanded ? null : article.id)}
                        className="mt-3 flex items-center gap-1 text-blue-600 text-sm font-semibold hover:underline"
                      >
                        {isExpanded ? l.hideText : l.readMore}
                        <ChevronRight size={14} className={`transition-transform ${isExpanded ? "rotate-90" : ""}`} />
                      </button>
                    )}
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
