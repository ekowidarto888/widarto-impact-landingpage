import { envVar } from "@/config/env-var";
import { Format } from "./works";

export type Article = {
  id: number;
  documentId: string;
  title: string;
  description: string;
  redirect_link: string;
  reading_time: string;
  slug: string;
  date_published: string;
  createdAt: string;
  updatedAt: string;
  publishedAt: string;
  cover: {
    id: number;
    documentId: string;
    name: string;
    alternativeText: string;
    caption: string;
    focalPoint: string;
    width: number;
    height: number;
    formats: Format;
    hash: string;
    ext: string;
    mime: string;
    size: number;
    url: string;
    previewUrl: string;
    provider: string;
    provider_metadata: string;
    createdAt: string;
    updatedAt: string;
    publishedAt: string;
  };
  author: {
    id: number;
    documentId: string;
    name: string;
    email: string;
    createdAt: string;
    updatedAt: string;
    publishedAt: string;
  };
  category: {
    id: number;
    documentId: string;
    name: string;
    slug: string;
    description: string;
    createdAt: string;
    updatedAt: string;
    publishedAt: string;
  };
  blocks: [
    {
      __component: string;
      id: number;
      body: string;
    },
  ];
};

export type FetchJournalsResponse = {
  data: Article[];
  meta: {
    pagination: {
      page: number;
      pageSize: number;
      pageCount: number;
      total: number;
    };
  };
};

export const getJournalsData = async (
  slug?: string,
): Promise<FetchJournalsResponse> => {
  const response = await fetch(
    `${envVar.API_URL}/api/articles?populate=*${slug ? `&filters[slug][$ne]=${slug}` : ""}`,
    {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${envVar.API_TOKEN}`,
      },
    },
  );

  if (!response.ok) throw new Error("Failed to fetch journals");
  return response.json();
};

export const getJournalDetailData = async (
  slug: string,
): Promise<FetchJournalsResponse> => {
  const response = await fetch(
    `${envVar.API_URL}/api/articles?populate=*&filters[slug][$eq]=${slug}`,
    {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${envVar.API_TOKEN}`,
      },
    },
  );

  if (!response.ok) throw new Error("Failed to fetch journal detail");
  return response.json();
};
