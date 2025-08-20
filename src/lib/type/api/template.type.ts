import { AuditInfo, Param } from "@type/common.type";

export type TemplateQueryParams = {
    name?: string;
    brand_id?:string
} & Param;

export type TemplateBody = {
  brand_id: string; 
  brand:string
  name: string;
  content: string;
  params?: string[]; 
}


export type Template = TemplateBody & AuditInfo;
