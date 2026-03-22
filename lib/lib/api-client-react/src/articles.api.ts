import { useMutation, useQuery } from "@tanstack/react-query";
import type {
    MutationFunction,
    QueryFunction,
    QueryKey,
    UseMutationOptions,
    UseMutationResult,
    UseQueryOptions,
    UseQueryResult,
} from "@tanstack/react-query";
import type { Article, ArticleInput } from "./generated/api.schemas";
import { customFetch } from "./custom-fetch";
import type { ErrorType, BodyType } from "./custom-fetch";

type AwaitedInput<T> = PromiseLike<T> | T;
type Awaited<O> = O extends AwaitedInput<infer T> ? T : never;
type SecondParameter<T extends (...args: never) => unknown> = Parameters<T>[1];

export const getArticlesUrl = () => `/api/articles`;

export const getArticles = async (
    options?: RequestInit,
): Promise<Article[]> => {
    return customFetch<Article[]>(getArticlesUrl(), {
        ...options,
        method: "GET",
    });
};

export const getGetArticlesQueryKey = () => [`/api/articles`] as const;

export const getGetArticlesQueryOptions = <
    TData = Awaited<ReturnType<typeof getArticles>>,
    TError = ErrorType<unknown>,
>(options?: {
    query?: UseQueryOptions<
        Awaited<ReturnType<typeof getArticles>>,
        TError,
        TData
    >;
    request?: SecondParameter<typeof customFetch>;
}) => {
    const { query: queryOptions, request: requestOptions } = options ?? {};
    const queryKey = queryOptions?.queryKey ?? getGetArticlesQueryKey();
    const queryFn: QueryFunction<Awaited<ReturnType<typeof getArticles>>> = ({
        signal,
    }) => getArticles({ signal, ...requestOptions });

    return { queryKey, queryFn, ...queryOptions } as UseQueryOptions<
        Awaited<ReturnType<typeof getArticles>>,
        TError,
        TData
    > & { queryKey: QueryKey };
};

export function useGetArticles<
    TData = Awaited<ReturnType<typeof getArticles>>,
    TError = ErrorType<unknown>,
>(options?: {
    query?: UseQueryOptions<
        Awaited<ReturnType<typeof getArticles>>,
        TError,
        TData
    >;
    request?: SecondParameter<typeof customFetch>;
}): UseQueryResult<TData, TError> & { queryKey: QueryKey } {
    const queryOptions = getGetArticlesQueryOptions(options);
    const query = useQuery(queryOptions) as UseQueryResult<TData, TError> & {
        queryKey: QueryKey;
    };
    return { ...query, queryKey: queryOptions.queryKey };
}

export const getCreateArticleUrl = () => `/api/articles`;

export const createArticle = async (
    articleInput: ArticleInput,
    options?: RequestInit,
): Promise<Article> => {
    return customFetch<Article>(getCreateArticleUrl(), {
        ...options,
        method: "POST",
        headers: { "Content-Type": "application/json", ...options?.headers },
        body: JSON.stringify(articleInput),
    });
};

export const getCreateArticleMutationOptions = <
    TError = ErrorType<unknown>,
    TContext = unknown,
>(options?: {
    mutation?: UseMutationOptions<
        Awaited<ReturnType<typeof createArticle>>,
        TError,
        { data: BodyType<ArticleInput> },
        TContext
    >;
    request?: SecondParameter<typeof customFetch>;
}): UseMutationOptions<
    Awaited<ReturnType<typeof createArticle>>,
    TError,
    { data: BodyType<ArticleInput> },
    TContext
> => {
    const mutationKey = ["createArticle"];
    const { mutation: mutationOptions, request: requestOptions } = options
        ? options.mutation &&
            "mutationKey" in options.mutation &&
            options.mutation.mutationKey
            ? options
            : { ...options, mutation: { ...options.mutation, mutationKey } }
        : { mutation: { mutationKey }, request: undefined };

    const mutationFn: MutationFunction<
        Awaited<ReturnType<typeof createArticle>>,
        { data: BodyType<ArticleInput> }
    > = (props) => {
        const { data } = props ?? {};
        return createArticle(data, requestOptions);
    };

    return { mutationFn, ...mutationOptions };
};

export const useCreateArticle = <
    TError = ErrorType<unknown>,
    TContext = unknown,
>(options?: {
    mutation?: UseMutationOptions<
        Awaited<ReturnType<typeof createArticle>>,
        TError,
        { data: BodyType<ArticleInput> },
        TContext
    >;
    request?: SecondParameter<typeof customFetch>;
}): UseMutationResult<
    Awaited<ReturnType<typeof createArticle>>,
    TError,
    { data: BodyType<ArticleInput> },
    TContext
> => {
    return useMutation(getCreateArticleMutationOptions(options));
};

export const getUpdateArticleUrl = (id: number) => `/api/articles/${id}`;

export const updateArticle = async (
    id: number,
    articleInput: ArticleInput,
    options?: RequestInit,
): Promise<Article> => {
    return customFetch<Article>(getUpdateArticleUrl(id), {
        ...options,
        method: "PUT",
        headers: { "Content-Type": "application/json", ...options?.headers },
        body: JSON.stringify(articleInput),
    });
};

export const getUpdateArticleMutationOptions = <
    TError = ErrorType<unknown>,
    TContext = unknown,
>(options?: {
    mutation?: UseMutationOptions<
        Awaited<ReturnType<typeof updateArticle>>,
        TError,
        { id: number; data: BodyType<ArticleInput> },
        TContext
    >;
    request?: SecondParameter<typeof customFetch>;
}): UseMutationOptions<
    Awaited<ReturnType<typeof updateArticle>>,
    TError,
    { id: number; data: BodyType<ArticleInput> },
    TContext
> => {
    const mutationKey = ["updateArticle"];
    const { mutation: mutationOptions, request: requestOptions } = options
        ? options.mutation &&
            "mutationKey" in options.mutation &&
            options.mutation.mutationKey
            ? options
            : { ...options, mutation: { ...options.mutation, mutationKey } }
        : { mutation: { mutationKey }, request: undefined };

    const mutationFn: MutationFunction<
        Awaited<ReturnType<typeof updateArticle>>,
        { id: number; data: BodyType<ArticleInput> }
    > = (props) => {
        const { id, data } = props ?? {};
        return updateArticle(id, data, requestOptions);
    };

    return { mutationFn, ...mutationOptions };
};

export const useUpdateArticle = <
    TError = ErrorType<unknown>,
    TContext = unknown,
>(options?: {
    mutation?: UseMutationOptions<
        Awaited<ReturnType<typeof updateArticle>>,
        TError,
        { id: number; data: BodyType<ArticleInput> },
        TContext
    >;
    request?: SecondParameter<typeof customFetch>;
}): UseMutationResult<
    Awaited<ReturnType<typeof updateArticle>>,
    TError,
    { id: number; data: BodyType<ArticleInput> },
    TContext
> => {
    return useMutation(getUpdateArticleMutationOptions(options));
};

export const getDeleteArticleUrl = (id: number) => `/api/articles/${id}`;

export const deleteArticle = async (
    id: number,
    options?: RequestInit,
): Promise<{ success: boolean; message?: string }> => {
    return customFetch<{ success: boolean; message?: string }>(getDeleteArticleUrl(id), {
        ...options,
        method: "DELETE",
    });
};

export const getDeleteArticleMutationOptions = <
    TError = ErrorType<unknown>,
    TContext = unknown,
>(options?: {
    mutation?: UseMutationOptions<
        Awaited<ReturnType<typeof deleteArticle>>,
        TError,
        { id: number },
        TContext
    >;
    request?: SecondParameter<typeof customFetch>;
}): UseMutationOptions<
    Awaited<ReturnType<typeof deleteArticle>>,
    TError,
    { id: number },
    TContext
> => {
    const mutationKey = ["deleteArticle"];
    const { mutation: mutationOptions, request: requestOptions } = options
        ? options.mutation &&
            "mutationKey" in options.mutation &&
            options.mutation.mutationKey
            ? options
            : { ...options, mutation: { ...options.mutation, mutationKey } }
        : { mutation: { mutationKey }, request: undefined };

    const mutationFn: MutationFunction<
        Awaited<ReturnType<typeof deleteArticle>>,
        { id: number }
    > = (props) => {
        const { id } = props ?? {};
        return deleteArticle(id, requestOptions);
    };

    return { mutationFn, ...mutationOptions };
};

export const useDeleteArticle = <
    TError = ErrorType<unknown>,
    TContext = unknown,
>(options?: {
    mutation?: UseMutationOptions<
        Awaited<ReturnType<typeof deleteArticle>>,
        TError,
        { id: number },
        TContext
    >;
    request?: SecondParameter<typeof customFetch>;
}): UseMutationResult<
    Awaited<ReturnType<typeof deleteArticle>>,
    TError,
    { id: number },
    TContext
> => {
    return useMutation(getDeleteArticleMutationOptions(options));
};
