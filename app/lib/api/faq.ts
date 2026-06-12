import { envVar } from "@/config/env-var";

export type FAQ = {
  id: number;
  question: string;
  answer: string;
};

export type InformationFAQ = {
  id: number;
  title: string;
  subtitle: string;
  subtitle_highlight: string;
  content: string;
  is_how_we_work: boolean;
  how_we_work_main: {
    id: number;
    phase_number: string;
    phase_name: string;
    phase_description: string;
    is_badge_show: boolean;
  }[]
};

export type FetchFAQResponse = {
  data: {
    id: number;
    documentId: string;
    createdAt: string;
    updatedAt: string;
    publishedAt: string;
    main: FAQ[];
  };
};

export type FetchInformationFAQResponse = {
  data: {
    id: number;
    documentId: string;
    createdAt: string;
    updatedAt: string;
    publishedAt: string;
    main: InformationFAQ[];
  };
};

export const getFAQData = async (): Promise<FetchFAQResponse> => {
  const response = await fetch(`${envVar.API_URL}/api/faq?populate=*`, {
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${envVar.API_TOKEN}`,
    },
    next: { revalidate: 3600 },
  });

  if (!response.ok) throw new Error("Failed to fetch FAQ");
  return response.json();
};

export const getInformationFAQData = async (): Promise<FetchInformationFAQResponse> => {
  const response = await fetch(
    `${envVar.API_URL}/api/information-faq?populate[main][populate]=how_we_work_main`,
    {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${envVar.API_TOKEN}`,
      },
    },
  );

  if (!response.ok) throw new Error("Failed to fetch Information FAQ");
  return response.json();
};
