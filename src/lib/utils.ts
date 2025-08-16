import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function transformAttioData(data: any[]) {
  console.log("data is here", data);

  const transformedData = data?.map((company) => {
    const webUrl = company?.web_url;
    const created_at = company?.created_at;
    const categories = company?.values?.categories?.map(
      (cat: any) => cat?.option?.title
    );
    const description = company?.values?.description?.[0]?.value;
    const name = company?.values?.name?.[0]?.value;
    const twitter = company?.values?.twitter?.[0]?.value;
    const linkedIn = company?.values?.linkedin?.[0]?.value;
    const domain = company?.values?.domains?.[0]?.domain;
    const location = company?.values?.primary_location?.[0]?.locality;

    return {
      webUrl,
      created_at,
      categories,
      description,
      name,
      twitter,
      linkedIn,
      domain,
      location,
    };
  });

  return transformedData;
}
