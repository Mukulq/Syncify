import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

export const apiSlice = createApi({
  reducerPath: "api",
  baseQuery: fetchBaseQuery({
    baseUrl: "http://localhost:5000/api",
    credentials: "include",
  }),
  endpoints: (builder) => ({
    signup: builder.mutation({
      query: (data) => ({
        url: "/users/register",
        method: "POST",
        body: data,
      }),
    }),
    login: builder.mutation({
      query: (data) => ({
        url: "/users/login",
        method: "POST",
        body: data,
      }),
    }),
    createRoom: builder.mutation({
      query: (data) => ({
        url: "/rooms/create",
        method: "POST",
        body: data,
      }),
    }),
    joinRoom: builder.mutation({
      query: ({ userId, roomId }) => ({
        url: `/rooms/join/${roomId}`,
        method: "POST",
        body: { userId },
      }),
    }),
    addMusicToQueue: builder.mutation({
      query: ({ roomId, userId, title, url, thumbnail }) => ({
        url: `/rooms/add-music/${roomId}`,
        method: "POST",
        body: { userId, title, url, thumbnail },
      }),
    }),
    getRoomInfo: builder.query({
      query: (roomId) => ({
        url: `/rooms/info/${roomId}`,
        method: "GET",
      }),
    }),
  }),
});

export const {
  useSignupMutation,
  useLoginMutation,
  useCreateRoomMutation,
  useJoinRoomMutation,
  useAddMusicToQueueMutation,
  useGetRoomInfoQuery,
} = apiSlice;
