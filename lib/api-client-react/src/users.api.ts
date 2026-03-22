import { useQuery, useMutation } from "@tanstack/react-query";
import type {
    MutationFunction,
    QueryFunction,
    QueryKey,
    UseMutationOptions,
    UseMutationResult,
    UseQueryOptions,
    UseQueryResult,
} from "@tanstack/react-query";
import { customFetch } from "./custom-fetch";
import type { ErrorType, BodyType } from "./custom-fetch";
import type { UserProfile } from "./generated/api.schemas";

type AwaitedInput<T> = PromiseLike<T> | T;
type Awaited<O> = O extends AwaitedInput<infer T> ? T : never;
type SecondParameter<T extends (...args: never) => unknown> = Parameters<T>[1];

export interface AdminUser extends UserProfile {
    isActive: boolean;
    permissions: Record<string, boolean> | null;
}

export const getAdminUsersUrl = () => `/api/admin/users`;

export const getAdminUsers = async (
    options?: RequestInit,
): Promise<AdminUser[]> => {
    return customFetch<AdminUser[]>(getAdminUsersUrl(), {
        ...options,
        method: "GET",
    });
};

export const getGetAdminUsersQueryKey = () => [`/api/admin/users`] as const;

export const getGetAdminUsersQueryOptions = <
    TData = Awaited<ReturnType<typeof getAdminUsers>>,
    TError = ErrorType<unknown>,
>(options?: {
    query?: UseQueryOptions<
        Awaited<ReturnType<typeof getAdminUsers>>,
        TError,
        TData
    >;
    request?: SecondParameter<typeof customFetch>;
}) => {
    const { query: queryOptions, request: requestOptions } = options ?? {};
    const queryKey = queryOptions?.queryKey ?? getGetAdminUsersQueryKey();
    const queryFn: QueryFunction<Awaited<ReturnType<typeof getAdminUsers>>> = ({
        signal,
    }) => getAdminUsers({ signal, ...requestOptions });

    return { queryKey, queryFn, ...queryOptions } as UseQueryOptions<
        Awaited<ReturnType<typeof getAdminUsers>>,
        TError,
        TData
    > & { queryKey: QueryKey };
};

export function useGetAdminUsers<
    TData = Awaited<ReturnType<typeof getAdminUsers>>,
    TError = ErrorType<unknown>,
>(options?: {
    query?: UseQueryOptions<
        Awaited<ReturnType<typeof getAdminUsers>>,
        TError,
        TData
    >;
    request?: SecondParameter<typeof customFetch>;
}): UseQueryResult<TData, TError> & { queryKey: QueryKey } {
    const queryOptions = getGetAdminUsersQueryOptions(options);
    const query = useQuery(queryOptions) as UseQueryResult<TData, TError> & {
        queryKey: QueryKey;
    };
    return { ...query, queryKey: queryOptions.queryKey };
}

export const getUpdateAdminUserUrl = (id: number) => `/api/admin/users/${id}`;

export const updateAdminUser = async (
    id: number,
    data: { role?: string; isActive?: boolean; permissions?: Record<string, boolean>; name?: string },
    options?: RequestInit,
): Promise<AdminUser> => {
    return customFetch<AdminUser>(getUpdateAdminUserUrl(id), {
        ...options,
        method: "PATCH",
        headers: { "Content-Type": "application/json", ...options?.headers },
        body: JSON.stringify(data),
    });
};

export const getUpdateAdminUserMutationOptions = <
    TError = ErrorType<unknown>,
    TContext = unknown,
>(options?: {
    mutation?: UseMutationOptions<
        Awaited<ReturnType<typeof updateAdminUser>>,
        TError,
        { id: number; data: BodyType<{ role?: string; isActive?: boolean; permissions?: Record<string, boolean>; name?: string }> },
        TContext
    >;
    request?: SecondParameter<typeof customFetch>;
}): UseMutationOptions<
    Awaited<ReturnType<typeof updateAdminUser>>,
    TError,
    { id: number; data: BodyType<{ role?: string; isActive?: boolean; permissions?: Record<string, boolean>; name?: string }> },
    TContext
> => {
    const mutationKey = ["updateAdminUser"];
    const { mutation: mutationOptions, request: requestOptions } = options
        ? options.mutation &&
            "mutationKey" in options.mutation &&
            options.mutation.mutationKey
            ? options
            : { ...options, mutation: { ...options.mutation, mutationKey } }
        : { mutation: { mutationKey }, request: undefined };

    const mutationFn: MutationFunction<
        Awaited<ReturnType<typeof updateAdminUser>>,
        { id: number; data: BodyType<{ role?: string; isActive?: boolean; permissions?: Record<string, boolean>; name?: string }> }
    > = (props) => {
        const { id, data } = props ?? {};
        return updateAdminUser(id, data, requestOptions);
    };

    return { mutationFn, ...mutationOptions };
};

export const useUpdateAdminUser = <
    TError = ErrorType<unknown>,
    TContext = unknown,
>(options?: {
    mutation?: UseMutationOptions<
        Awaited<ReturnType<typeof updateAdminUser>>,
        TError,
        { id: number; data: BodyType<{ role?: string; isActive?: boolean; permissions?: Record<string, boolean>; name?: string }> },
        TContext
    >;
    request?: SecondParameter<typeof customFetch>;
}): UseMutationResult<
    Awaited<ReturnType<typeof updateAdminUser>>,
    TError,
    { id: number; data: BodyType<{ role?: string; isActive?: boolean; permissions?: Record<string, boolean>; name?: string }> },
    TContext
> => {
    return useMutation(getUpdateAdminUserMutationOptions(options));
};

export const getDeleteAdminUserUrl = (id: number) => `/api/admin/users/${id}`;

export const deleteAdminUser = async (
    id: number,
    options?: RequestInit,
): Promise<{ success: boolean; message?: string }> => {
    return customFetch<{ success: boolean; message?: string }>(getDeleteAdminUserUrl(id), {
        ...options,
        method: "DELETE",
    });
};

export const getDeleteAdminUserMutationOptions = <
    TError = ErrorType<unknown>,
    TContext = unknown,
>(options?: {
    mutation?: UseMutationOptions<
        Awaited<ReturnType<typeof deleteAdminUser>>,
        TError,
        { id: number },
        TContext
    >;
    request?: SecondParameter<typeof customFetch>;
}): UseMutationOptions<
    Awaited<ReturnType<typeof deleteAdminUser>>,
    TError,
    { id: number },
    TContext
> => {
    const mutationKey = ["deleteAdminUser"];
    const { mutation: mutationOptions, request: requestOptions } = options
        ? options.mutation &&
            "mutationKey" in options.mutation &&
            options.mutation.mutationKey
            ? options
            : { ...options, mutation: { ...options.mutation, mutationKey } }
        : { mutation: { mutationKey }, request: undefined };

    const mutationFn: MutationFunction<
        Awaited<ReturnType<typeof deleteAdminUser>>,
        { id: number }
    > = (props) => {
        const { id } = props ?? {};
        return deleteAdminUser(id, requestOptions);
    };

    return { mutationFn, ...mutationOptions };
};

export const useDeleteAdminUser = <
    TError = ErrorType<unknown>,
    TContext = unknown,
>(options?: {
    mutation?: UseMutationOptions<
        Awaited<ReturnType<typeof deleteAdminUser>>,
        TError,
        { id: number },
        TContext
    >;
    request?: SecondParameter<typeof customFetch>;
}): UseMutationResult<
    Awaited<ReturnType<typeof deleteAdminUser>>,
    TError,
    { id: number },
    TContext
> => {
    return useMutation(getDeleteAdminUserMutationOptions(options));
};
